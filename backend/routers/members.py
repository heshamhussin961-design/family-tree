import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Query
from sqlalchemy.orm import Session

from db import get_db
from models import FamilyMember, Spouse
from schemas import (
    SearchResult, FamilyMemberDetail, LineageResponse,
    FamilyMemberCreate, FamilyMemberUpdate, SpouseResponse, SpouseCreate
)
from deps import (
    get_member_or_404, get_app_setting, get_lineage, get_descendants_tree,
    validate_family_logic, row_to_schema, model_to_dict, log_action,
    require_auth, require_admin, is_admin_request, get_current_user,
    check_branch_permission, write_limiter, search_limiter, is_descendant_of
)

router = APIRouter(tags=["Family Members"])

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"

@router.get("/search", response_model=List[SearchResult])
def search_members(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100),
                   request: Request = None, db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """Search for family members by name."""
    client_ip = request.client.host if request and request.client else "unknown"
    if not search_limiter.is_allowed(f"search:{client_ip}"):
        raise HTTPException(status_code=429, detail="طلبات كثيرة — حاول بعد دقيقة")
    
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    members = db.query(FamilyMember).filter(FamilyMember.full_name.contains(q)).filter(FamilyMember.is_approved == True)
    
    if not is_admin:
        members = members.filter(FamilyMember.is_public == True)
        if not show_females:
            members = members.filter(FamilyMember.gender != "female")
            
    return [SearchResult.model_validate(m) for m in members.limit(limit).all()]

@router.get("/members", response_model=List[SearchResult])
def list_members(limit: int = Query(100, ge=1, le=2000), offset: int = Query(0, ge=0),
                 db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """List all approved members with pagination."""
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    q = db.query(FamilyMember).filter(FamilyMember.is_approved == True)
    
    if not is_admin:
        q = q.filter(FamilyMember.is_public == True)
        if not show_females:
            q = q.filter(FamilyMember.gender != "female")
            
    return [SearchResult.model_validate(m) for m in q.order_by(FamilyMember.full_name.asc()).offset(offset).limit(limit).all()]

@router.get("/person/{member_id}", response_model=LineageResponse)
def get_person(member_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """Get detailed info and lineage for a specific person."""
    person = get_member_or_404(db, member_id)
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    
    if not is_admin:
        if not person.is_public:
             raise HTTPException(status_code=404, detail="الشخص غير موجود")
        if person.gender == "female" and not show_females:
            raise HTTPException(status_code=404, detail="الشخص غير موجود")
    
    # Load spouses
    spouses = db.query(Spouse).filter(Spouse.member_id == member_id).all()
    
    # Get lineage
    lineage_rows = get_lineage(db, member_id, hide_females=not is_admin)
    
    detail = FamilyMemberDetail.model_validate(person)
    detail.spouses = [SpouseResponse.model_validate(s) for s in spouses]
    
    return LineageResponse(person=detail, lineage=[row_to_schema(r) for r in lineage_rows])

@router.post("/members/{member_id}/spouses", response_model=SpouseResponse)
def add_spouse(member_id: int, payload: SpouseCreate, db: Session = Depends(get_db), user: dict = Depends(require_auth)):
    """Add a spouse to a member."""
    member = get_member_or_404(db, member_id)
    
    if user["role"] != "admin":
        if not is_descendant_of(db, member_id, user["branch_root_id"]):
            raise HTTPException(status_code=403, detail="ليس لديك صلاحية إضافة زوجة لهذا الشخص")

    spouse = Spouse(**payload.model_dump(), member_id=member_id)
    db.add(spouse)
    db.commit()
    db.refresh(spouse)
    
    log_action(db, user, "ADD_SPOUSE", "spouses", spouse.id, new_values=model_to_dict(spouse))
    return spouse

@router.delete("/spouses/{spouse_id}")
def delete_spouse(spouse_id: int, db: Session = Depends(get_db), user: dict = Depends(require_auth)):
    """Delete a spouse record."""
    spouse = db.query(Spouse).filter(Spouse.id == spouse_id).first()
    if not spouse:
        raise HTTPException(status_code=404, detail="الزوجة غير موجودة")
    
    if user["role"] != "admin":
        if not is_descendant_of(db, spouse.member_id, user["branch_root_id"]):
            raise HTTPException(status_code=403, detail="ليس لديك صلاحية حذف هذه الزوجة")

    old_val = model_to_dict(spouse)
    db.delete(spouse)
    db.commit()
    
    log_action(db, user, "DELETE_SPOUSE", "spouses", spouse_id, old_values=old_val)
    return {"detail": "تم الحذف"}

@router.get("/children/{member_id}", response_model=List[SearchResult])
def get_children(member_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """List children of a specific member."""
    get_member_or_404(db, member_id)
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    q = db.query(FamilyMember).filter(FamilyMember.parent_id == member_id, FamilyMember.is_approved == True)
    
    if not is_admin:
        q = q.filter(FamilyMember.is_public == True)
        if not show_females:
            q = q.filter(FamilyMember.gender != "female")
            
    return [SearchResult.model_validate(c) for c in q.order_by(FamilyMember.full_name).all()]

@router.get("/tree/{member_id}", response_model=List[SearchResult])
def get_tree(member_id: int, db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """Get the descendants tree for a specific member."""
    get_member_or_404(db, member_id)
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    rows = get_descendants_tree(db, member_id, is_admin=is_admin, hide_females=not show_females)
    return [row_to_schema(r) for r in rows]

@router.get("/roots", response_model=List[SearchResult])
def get_roots(limit: int = 20, db: Session = Depends(get_db), is_admin: bool = Depends(is_admin_request)):
    """List original patriarchs (people without parents)."""
    show_females = get_app_setting(db, "show_females_to_visitors", "true") == "true"
    q = db.query(FamilyMember).filter(FamilyMember.parent_id == None, FamilyMember.is_approved == True)
    
    if not is_admin:
        q = q.filter(FamilyMember.is_public == True)
        if not show_females:
            q = q.filter(FamilyMember.gender != "female")
            
    return [SearchResult.model_validate(r) for r in q.order_by(FamilyMember.full_name).limit(limit).all()]

@router.post("/members", response_model=FamilyMemberDetail)
def create_member(payload: FamilyMemberCreate, request: Request,
                  db: Session = Depends(get_db),
                  user: Optional[dict] = Depends(get_current_user)):
    """Add a family member. Authenticated users can only add under their branch."""
    validate_family_logic(db, payload)
    client_ip = request.client.host if request.client else "unknown"
    if not write_limiter.is_allowed(f"create:{client_ip}"):
        raise HTTPException(status_code=429, detail="إضافات كثيرة — حاول بعد دقيقة")

    if payload.parent_id:
        parent = db.query(FamilyMember).filter(FamilyMember.id == payload.parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail=f"الأب رقم {payload.parent_id} غير موجود")

    if user and user["role"] != "admin":
        check_branch_permission(db, user, payload.parent_id, "إضافة")

    member = FamilyMember(
        **payload.model_dump(exclude={"spouses", "is_public"}),
        is_public=payload.is_public if user and user["role"] == "admin" else True,
        is_approved=(user is not None and user["role"] == "admin")
    )
    db.add(member)
    db.flush()

    if payload.spouses:
        for s_data in payload.spouses:
            spouse = Spouse(**s_data.model_dump(), member_id=member.id)
            db.add(spouse)

    db.commit()
    db.refresh(member)
    
    log_action(db, user, "CREATE", "family_members", member.id, new_values=model_to_dict(member))
    
    spouses = db.query(Spouse).filter(Spouse.member_id == member.id).all()
    resp = FamilyMemberDetail.model_validate(member)
    resp.spouses = [SpouseResponse.model_validate(s) for s in spouses]
    return resp

@router.get("/members/pending", response_model=List[SearchResult])
def get_pending_members(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List all pending members. Admin only."""
    members = db.query(FamilyMember).filter(FamilyMember.is_approved == False).order_by(FamilyMember.full_name.asc()).all()
    return [SearchResult.model_validate(m) for m in members]

@router.put("/members/{member_id}/approve", response_model=FamilyMemberDetail)
def approve_member(member_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Approve a member addition. Admin only."""
    member = get_member_or_404(db, member_id)
    old_val = model_to_dict(member)
    member.is_approved = True
    db.commit()
    db.refresh(member)
    log_action(db, admin, "APPROVE", "family_members", member.id, old_values=old_val, new_values=model_to_dict(member))
    return FamilyMemberDetail.model_validate(member)

@router.put("/members/{member_id}", response_model=FamilyMemberDetail)
def update_member(member_id: int, payload: FamilyMemberUpdate,
                  db: Session = Depends(get_db), user: dict = Depends(require_auth)):
    """Update a member. Admin: any member. Branch editor: only under their branch."""
    member = get_member_or_404(db, member_id)
    validate_family_logic(db, payload, member_id=member_id)
    old_val = model_to_dict(member)

    if user["role"] != "admin":
        if not user.get("branch_root_id") or not is_descendant_of(db, member_id, user["branch_root_id"]):
            raise HTTPException(status_code=403, detail="ليس لديك صلاحية تعديل هذا الشخص — هو خارج فرعك")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    log_action(db, user, "UPDATE", "family_members", member.id, old_values=old_val, new_values=model_to_dict(member))
    return FamilyMemberDetail.model_validate(member)

@router.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), admin: dict = Depends(require_admin)):
    """Delete a member. Admin only."""
    member = get_member_or_404(db, member_id)
    old_val = model_to_dict(member)
    
    db.query(FamilyMember).filter(FamilyMember.parent_id == member_id).update(
        {FamilyMember.parent_id: member.parent_id}
    )
    db.delete(member)
    db.commit()
    log_action(db, admin, "DELETE", "family_members", member_id, old_values=old_val)
    return {"detail": "تم الحذف", "id": member_id}

@router.post("/members/{member_id}/photo", response_model=FamilyMemberDetail)
async def upload_photo(member_id: int, request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a profile photo for a member."""
    client_ip = request.client.host if request.client else "unknown"
    if not write_limiter.is_allowed(f"photo:{client_ip}"):
        raise HTTPException(status_code=429, detail="رفع صور كثيرة — حاول بعد دقيقة")
    
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_PHOTO_SIZE = 5 * 1024 * 1024
    
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="نوع الملف غير مدعوم — JPG/PNG/WEBP فقط")
    
    member = get_member_or_404(db, member_id)
    contents = await file.read()
    if len(contents) > MAX_PHOTO_SIZE:
        raise HTTPException(status_code=413, detail="حجم الصورة يتجاوز 5 ميجا")
        
    if member.image_url:
        old_path = UPLOADS_DIR / member.image_url.lstrip("/")
        if old_path.exists():
            old_path.unlink(missing_ok=True)
            
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{member_id}_{uuid.uuid4().hex[:8]}{ext}"
    dest = UPLOADS_DIR / filename
    dest.write_bytes(contents)
    
    old_val = model_to_dict(member)
    member.image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(member)
    log_action(db, {"user_id": None, "username": "system"}, "UPDATE_PHOTO", "family_members", member.id, old_values=old_val, new_values=model_to_dict(member))
    return FamilyMemberDetail.model_validate(member)

@router.delete("/members/{member_id}/photo", response_model=FamilyMemberDetail)
def remove_photo(member_id: int, db: Session = Depends(get_db)):
    """Remove a profile photo from a member."""
    member = get_member_or_404(db, member_id)
    if member.image_url:
        filename = member.image_url.split("/")[-1]
        old_path = UPLOADS_DIR / filename
        if old_path.exists():
            old_path.unlink(missing_ok=True)
            
    old_val = model_to_dict(member)
    member.image_url = None
    db.commit()
    db.refresh(member)
    log_action(db, {"user_id": None, "username": "system"}, "DELETE_PHOTO", "family_members", member.id, old_values=old_val, new_values=model_to_dict(member))
    return FamilyMemberDetail.model_validate(member)
