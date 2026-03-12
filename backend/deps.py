import os
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from collections import defaultdict

from fastapi import HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt as bcrypt_lib
from sqlalchemy import text, func
from sqlalchemy.orm import Session

from db import get_db
from models import FamilyMember, User, AuditLog, AppSetting, Spouse
from schemas import SearchResult

logger = logging.getLogger("family-tree")

# ── Config ────────────────────────────────────────────────────────────────────
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "family2026")
JWT_SECRET     = os.getenv("JWT_SECRET", "change-me-jwt-secret-key")
JWT_ALGORITHM  = "HS256"
JWT_EXPIRE_H   = 24
MAX_LINEAGE_DEPTH = 50

# ── Hashing ───────────────────────────────────────────────────────────────────
class MyCryptContext:
    def hash(self, secret: str) -> str:
        salt = bcrypt_lib.gensalt()
        return bcrypt_lib.hashpw(secret.encode('utf-8'), salt).decode('utf-8')

    def verify(self, secret: str, hash: str) -> bool:
        try:
            return bcrypt_lib.checkpw(secret.encode('utf-8'), hash.encode('utf-8'))
        except Exception:
            return False

pwd_context = MyCryptContext()

# ── Auth ──────────────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_H)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[dict]:
    if not token:
        return None
    payload = _decode_token(token)
    if not payload:
        return None
    role = payload.get("role")
    user_id = payload.get("user_id")
    if role == "admin" and not user_id:
        return {"role": "admin", "user_id": None, "branch_root_id": None, "username": payload.get("sub", "admin")}
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return {"role": user.role, "user_id": user.id, "branch_root_id": user.branch_root_id, "username": user.username}
    return None

def require_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="غير مسموح — سجّل دخول أولاً")
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="صلاحيات الأدمن مطلوبة")
    return user

def require_auth(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="غير مسموح — سجّل دخول أولاً")
    return user

def is_admin_request(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> bool:
    user = get_current_user(token, db)
    return user is not None and user["role"] == "admin"

# ── Permissions ───────────────────────────────────────────────────────────────
def is_descendant_of(db: Session, member_id: int, root_id: int) -> bool:
    if member_id == root_id:
        return True
    query = text("""
        WITH RECURSIVE ancestors(id, parent_id, depth) AS (
            SELECT id, parent_id, 1 FROM family_members WHERE id = :member_id
            UNION ALL
            SELECT fm.id, fm.parent_id, a.depth + 1
            FROM family_members fm
            JOIN ancestors a ON fm.id = a.parent_id
            WHERE a.depth < :max_depth
        )
        SELECT COUNT(*) FROM ancestors WHERE id = :root_id
    """)
    count = db.execute(query, {"member_id": member_id, "root_id": root_id, "max_depth": MAX_LINEAGE_DEPTH}).scalar()
    return count > 0

def check_branch_permission(db: Session, user: dict, parent_id: Optional[int], action: str = "إضافة"):
    if user["role"] == "admin":
        return
    if not user.get("branch_root_id"):
        raise HTTPException(status_code=403, detail=f"ليس لديك صلاحية {action} — لم يتم تحديد فرع لك")
    if not parent_id:
        raise HTTPException(status_code=403, detail=f"ليس لديك صلاحية {action} في الجذر — يجب اختيار أب من فرعك")
    if not is_descendant_of(db, parent_id, user["branch_root_id"]):
        raise HTTPException(status_code=403, detail=f"ليس لديك صلاحية {action} في هذا الفرع")

# ── Rate Limiter ──────────────────────────────────────────────────────────────
class RateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.requests[key] = [t for t in self.requests[key] if now - t < self.window]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True

write_limiter = RateLimiter(max_requests=30, window_seconds=60)
search_limiter = RateLimiter(max_requests=60, window_seconds=60)

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_member_or_404(db: Session, member_id: int) -> FamilyMember:
    if not isinstance(member_id, int) or member_id < 1:
        raise HTTPException(status_code=400, detail="معرف الشخص غير صالح")
    m = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail=f"الشخص رقم {member_id} غير موجود")
    return m

def get_app_setting(db: Session, key: str, default: str = None) -> Optional[str]:
    s = db.query(AppSetting).filter(AppSetting.key == key).first()
    return s.value if s else default

def row_to_schema(row):
    return SearchResult(
        id=row[0], full_name=row[1], branch_name=row[2], parent_id=row[3],
        image_url=row[4], gender=row[5], birth_year=row[6], death_year=row[7],
        email=row[8], phone=row[9],
        is_alive=bool(row[10]) if row[10] is not None else True,
        blood_type=row[11], profession=row[12], university_degree=row[13],
        job_title=row[14],
        is_student=bool(row[15]) if row[15] is not None else False,
        looking_for_job=bool(row[16]) if row[16] is not None else False,
        is_approved=bool(row[17]) if len(row) > 17 and row[17] is not None else True,
        birth_place=row[18] if len(row) > 18 else None,
        residence_place=row[19] if len(row) > 19 else None,
        is_married=bool(row[20]) if len(row) > 20 and row[20] is not None else False,
        is_public=bool(row[21]) if len(row) > 21 and row[21] is not None else True,
        marital_status=row[22] if len(row) > 22 else None
    )

def model_to_dict(obj):
    if obj is None:
        return None
    d = {}
    for column in obj.__table__.columns:
        val = getattr(obj, column.name)
        if hasattr(val, "isoformat"):
            val = val.isoformat()
        d[column.name] = val
    return d

def log_action(db: Session, user: Optional[dict], action: str, target_table: str, target_id: int, old_values: dict = None, new_values: dict = None):
    log_entry = AuditLog(
        user_id=user["user_id"] if user and user.get("user_id") else None,
        username=user["username"] if user else "system",
        action=action,
        target_table=target_table,
        target_id=target_id,
        old_values=old_values,
        new_values=new_values
    )
    db.add(log_entry)

def get_descendants_tree(db: Session, member_id: int, is_admin: bool, hide_females: bool, max_depth: int = 10):
    query = text("""
        WITH RECURSIVE descendants(id, full_name, branch_name, parent_id,
                                   image_url, gender, birth_year, death_year,
                                   email, phone, is_alive, blood_type,
                                    profession, university_degree, job_title,
                                    is_student, looking_for_job, is_approved,
                                    birth_place, residence_place, is_married, is_public, marital_status, depth) AS (
            SELECT id, full_name, branch_name, parent_id,
                   image_url, gender, birth_year, death_year,
                   email, phone, is_alive, blood_type,
                   profession, university_degree, job_title,
                   is_student, looking_for_job, is_approved,
                   birth_place, residence_place, is_married, is_public, marital_status, 0
            FROM family_members WHERE id = :member_id
            UNION ALL
            SELECT fm.id, fm.full_name, fm.branch_name, fm.parent_id,
                   fm.image_url, fm.gender, fm.birth_year, fm.death_year,
                   fm.email, fm.phone, fm.is_alive, fm.blood_type,
                   fm.profession, fm.university_degree, fm.job_title,
                   fm.is_student, fm.looking_for_job, fm.is_approved,
                   fm.birth_place, fm.residence_place, fm.is_married, fm.is_public, fm.marital_status, d.depth + 1
            FROM family_members fm
            JOIN descendants d ON fm.parent_id = d.id
            WHERE d.depth < :max_depth
        )
        SELECT id, full_name, branch_name, parent_id,
               image_url, gender, birth_year, death_year,
               email, phone, is_alive, blood_type,
               profession, university_degree, job_title,
               is_student, looking_for_job, is_approved,
               birth_place, residence_place, is_married, is_public, marital_status
        FROM descendants ORDER BY depth, full_name
    """)
    rows = db.execute(query, {"member_id": member_id, "max_depth": max_depth}).fetchall()
    
    filtered_rows = []
    for r in rows:
        if not is_admin:
            if not r[21]: continue
            if hide_females and r[5] == "female": continue
        filtered_rows.append(r)
    return filtered_rows

def get_lineage(db: Session, member_id: int, hide_females: bool):
    query = text("""
        WITH RECURSIVE ancestors(id, full_name, branch_name, parent_id,
                                 image_url, gender, birth_year, death_year,
                                 email, phone, is_alive, blood_type,
                                 profession, university_degree, job_title,
                                 is_student, looking_for_job, is_approved,
                                 birth_place, residence_place, is_married, is_public, marital_status, depth) AS (
            SELECT id, full_name, branch_name, parent_id,
                   image_url, gender, birth_year, death_year,
                   email, phone, is_alive, blood_type,
                   profession, university_degree, job_title,
                   is_student, looking_for_job, is_approved,
                   birth_place, residence_place, is_married, is_public, marital_status, 1
            FROM family_members WHERE id = :member_id
            UNION ALL
            SELECT fm.id, fm.full_name, fm.branch_name, fm.parent_id,
                   fm.image_url, fm.gender, fm.birth_year, fm.death_year,
                   fm.email, fm.phone, fm.is_alive, fm.blood_type,
                   fm.profession, fm.university_degree, fm.job_title,
                   fm.is_student, fm.looking_for_job, fm.is_approved,
                   fm.birth_place, fm.residence_place, fm.is_married, fm.is_public, fm.marital_status, a.depth + 1
            FROM family_members fm
            JOIN ancestors a ON fm.id = a.parent_id
            WHERE a.depth < :max_depth
        )
        SELECT id, full_name, branch_name, parent_id,
               image_url, gender, birth_year, death_year,
               email, phone, is_alive, blood_type,
               profession, university_degree, job_title,
               is_student, looking_for_job, is_approved,
               birth_place, residence_place, is_married, is_public, marital_status
        FROM ancestors
    """)
    rows = db.execute(query, {"member_id": member_id, "max_depth": MAX_LINEAGE_DEPTH}).fetchall()
    lineage = list(reversed(rows))
    if hide_females:
        lineage = [r for r in lineage if r[5] != "female"]
    return lineage

def validate_family_logic(db: Session, payload, member_id: Optional[int] = None):
    current_year = datetime.now().year
    birth = getattr(payload, 'birth_year', None)
    death = getattr(payload, 'death_year', None)
    parent_id = getattr(payload, 'parent_id', None)

    if birth and birth > current_year:
        raise HTTPException(status_code=400, detail="سنة الميلاد لا يمكن أن تكون في المستقبل")
    if birth and death and death < birth:
        raise HTTPException(status_code=400, detail="سنة الوفاة لا يمكن أن تكون قبل سنة الميلاد")
    
    if member_id and parent_id == member_id:
        raise HTTPException(status_code=400, detail="لا يمكن للشخص أن يكون أبًا لنفسه")

    if parent_id:
        parent = db.query(FamilyMember).filter(FamilyMember.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="الأب المختار غير موجود")
        
        if birth and parent.birth_year and birth < parent.birth_year + 15:
            raise HTTPException(status_code=400, detail=f"خطأ منطقي: سنة الميلاد يجب أن تكون بعد سنة ميلاد الأب ({parent.birth_year}) بـ 15 سنة على الأقل")

        if member_id:
            descendants = get_descendants_tree(db, member_id, is_admin=True, hide_females=False, max_depth=MAX_LINEAGE_DEPTH)
            descendant_ids = [d[0] for d in descendants]
            if parent_id in descendant_ids:
                raise HTTPException(status_code=400, detail="خطأ: لا يمكن تعيين أحد الأبناء أو الأحفاد كأب (سيؤدي ذلك لدائرة مفرغة)")
