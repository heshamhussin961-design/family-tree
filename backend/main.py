import os
import uuid
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, Depends, Security, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from jose import JWTError, jwt

from db import Base, engine, get_db
from models import FamilyMember
from schemas import (
    SearchResult, FamilyMemberDetail, LineageResponse,
    FamilyMemberCreate, FamilyMemberUpdate,
    LoginRequest, TokenResponse, StatsResponse,
)

load_dotenv()

Base.metadata.create_all(bind=engine)

# ── Config ────────────────────────────────────────────────────────────────────
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "family2026")
JWT_SECRET     = os.getenv("JWT_SECRET", "change-me-jwt-secret-key")
JWT_ALGORITHM  = "HS256"
JWT_EXPIRE_H   = 12

# ── Token helpers ─────────────────────────────────────────────────────────────
def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_H)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login", auto_error=False)

def get_current_admin(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="غير مسموح — سجّل دخول أولاً")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="صلاحيات الأدمن مطلوبة")
    except JWTError:
        raise HTTPException(status_code=401, detail="توكن غير صالح")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Family Tree API",
    docs_url=None, redoc_url=None, openapi_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# On Vercel the task filesystem is read-only; use /tmp for writable storage
if os.getenv("VERCEL") or not os.access(Path(__file__).resolve().parent, os.W_OK):
    UPLOADS_DIR = Path("/tmp/uploads")
else:
    UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Only mount static files if the directory is accessible
try:
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
except Exception:
    pass  # If /tmp/uploads is empty, StaticFiles may fail — ignore on cold start


# ── Helper ────────────────────────────────────────────────────────────────────
def get_member_or_404(db: Session, member_id: int) -> FamilyMember:
    m = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail=f"الشخص رقم {member_id} غير موجود")
    return m


def get_lineage(db: Session, member_id: int):
    query = text("""
        WITH RECURSIVE ancestors(id, full_name, branch_name, parent_id,
                                 image_url, gender, birth_year, death_year,
                                 email, phone, is_alive) AS (
            SELECT id, full_name, branch_name, parent_id,
                   image_url, gender, birth_year, death_year,
                   email, phone, is_alive
            FROM family_members
            WHERE id = :member_id
            UNION ALL
            SELECT fm.id, fm.full_name, fm.branch_name, fm.parent_id,
                   fm.image_url, fm.gender, fm.birth_year, fm.death_year,
                   fm.email, fm.phone, fm.is_alive
            FROM family_members fm
            JOIN ancestors a ON fm.id = a.parent_id
        )
        SELECT * FROM ancestors
    """)
    rows = db.execute(query, {"member_id": member_id}).fetchall()
    return list(reversed(rows))


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غلط")
    token = create_token({"sub": payload.username, "role": "admin"})
    return TokenResponse(access_token=token)


# ═══════════════════════════════════════════════════════════════════════════════
#  STATS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total   = db.query(func.count(FamilyMember.id)).scalar() or 0
    living  = db.query(func.count(FamilyMember.id)).filter(FamilyMember.is_alive == True).scalar() or 0
    deceased = total - living

    # Estimate generations by counting max depth via recursive CTE
    gen_query = text("""
        WITH RECURSIVE gen(id, depth) AS (
            SELECT id, 1 FROM family_members WHERE parent_id IS NULL
            UNION ALL
            SELECT fm.id, g.depth + 1
            FROM family_members fm
            JOIN gen g ON fm.parent_id = g.id
        )
        SELECT COALESCE(MAX(depth), 0) FROM gen
    """)
    generations = db.execute(gen_query).scalar() or 0

    return StatsResponse(total=total, living=living, deceased=deceased, generations=generations)


# ═══════════════════════════════════════════════════════════════════════════════
#  SEARCH & LIST
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/search", response_model=List[SearchResult])
def search_members(q: str = Query(..., min_length=1), limit: int = 20, db: Session = Depends(get_db)):
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.full_name.contains(q))
        .limit(limit)
        .all()
    )
    return [SearchResult.model_validate(m) for m in members]


@app.get("/members", response_model=List[SearchResult])
def list_members(limit: int = 500, db: Session = Depends(get_db)):
    members = (
        db.query(FamilyMember)
        .order_by(FamilyMember.full_name.asc())
        .limit(limit)
        .all()
    )
    return [SearchResult.model_validate(m) for m in members]


@app.get("/person/{member_id}", response_model=LineageResponse)
def get_person(member_id: int, db: Session = Depends(get_db)):
    person = get_member_or_404(db, member_id)
    lineage_rows = get_lineage(db, member_id)

    def row_to_schema(row):
        return SearchResult(
            id=row[0], full_name=row[1], branch_name=row[2], parent_id=row[3],
            image_url=row[4], gender=row[5], birth_year=row[6], death_year=row[7],
            email=row[8], phone=row[9], is_alive=bool(row[10]) if row[10] is not None else True,
        )

    return LineageResponse(
        person=FamilyMemberDetail.model_validate(person),
        lineage=[row_to_schema(r) for r in lineage_rows],
    )


@app.get("/children/{member_id}", response_model=List[SearchResult])
def get_children(member_id: int, db: Session = Depends(get_db)):
    get_member_or_404(db, member_id)
    children = (
        db.query(FamilyMember)
        .filter(FamilyMember.parent_id == member_id)
        .order_by(FamilyMember.full_name)
        .all()
    )
    return [SearchResult.model_validate(c) for c in children]


@app.get("/roots", response_model=List[SearchResult])
def get_roots(limit: int = 20, db: Session = Depends(get_db)):
    roots = (
        db.query(FamilyMember)
        .filter(FamilyMember.parent_id == None)
        .order_by(FamilyMember.full_name)
        .limit(limit)
        .all()
    )
    return [SearchResult.model_validate(r) for r in roots]


# ═══════════════════════════════════════════════════════════════════════════════
#  WRITE ENDPOINTS (admin only)
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/members", response_model=FamilyMemberDetail)
def create_member(payload: FamilyMemberCreate, db: Session = Depends(get_db)):
    """Public — anyone can add a family member."""
    member = FamilyMember(**payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return FamilyMemberDetail.model_validate(member)


@app.put("/members/{member_id}", response_model=FamilyMemberDetail, dependencies=[Depends(get_current_admin)])
def update_member(member_id: int, payload: FamilyMemberUpdate, db: Session = Depends(get_db)):
    member = get_member_or_404(db, member_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return FamilyMemberDetail.model_validate(member)


@app.delete("/members/{member_id}", dependencies=[Depends(get_current_admin)])
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = get_member_or_404(db, member_id)
    # Re-parent children to their grandparent
    db.query(FamilyMember).filter(FamilyMember.parent_id == member_id).update(
        {FamilyMember.parent_id: member.parent_id}
    )
    db.delete(member)
    db.commit()
    return {"detail": "تم الحذف", "id": member_id}


# ═══════════════════════════════════════════════════════════════════════════════
#  PHOTO UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_PHOTO_SIZE = 5 * 1024 * 1024  # 5 MB

@app.post("/members/{member_id}/photo", response_model=FamilyMemberDetail)
async def upload_photo(
    member_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload / replace a member's profile photo. Open to everyone."""
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="نوع الملف غير مدعوم — JPG/PNG/WEBP فقط")

    member = get_member_or_404(db, member_id)

    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_PHOTO_SIZE:
        raise HTTPException(status_code=413, detail="حجم الصورة يتجاوز 5 ميجا")

    # Remove old photo if exists
    if member.image_url:
        old_path = Path(__file__).resolve().parent / member.image_url.lstrip("/")
        if old_path.exists():
            old_path.unlink(missing_ok=True)

    # Save with unique name
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{member_id}_{uuid.uuid4().hex[:8]}{ext}"
    dest = UPLOADS_DIR / filename
    dest.write_bytes(contents)

    member.image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(member)
    return FamilyMemberDetail.model_validate(member)

