from fastapi import APIRouter, HTTPException, Depends, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import secrets
from typing import List

from db import get_db
from models import User, Invitation, FamilyMember, AuditLog
from schemas import (
    LoginRequest, TokenResponse, RegisterRequest, UserResponse,
    AdminPasswordReset, InvitationCreate, InvitationResponse, InvitationPublic, UserRoleUpdate
)
from deps import (
    create_token, pwd_context, write_limiter, 
    ADMIN_USERNAME, ADMIN_PASSWORD, require_auth, require_admin,
    get_member_or_404, get_app_setting
)

router = APIRouter(tags=["Auth & Users"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    if not write_limiter.is_allowed(f"login:{client_ip}"):
        raise HTTPException(status_code=429, detail="محاولات كثيرة — حاول بعد دقيقة")

    # Check built-in admin first
    db_admin_pass = get_app_setting(db, "ADMIN_PASSWORD_HASH")
    if db_admin_pass:
        if payload.username == ADMIN_USERNAME and pwd_context.verify(payload.password, db_admin_pass):
            token = create_token({"sub": payload.username, "role": "admin"})
            return TokenResponse(access_token=token, role="admin", display_name="أدمن")
    else:
        if payload.username == ADMIN_USERNAME and payload.password == ADMIN_PASSWORD:
            token = create_token({"sub": payload.username, "role": "admin"})
            return TokenResponse(access_token=token, role="admin", display_name="أدمن")

    # Check DB users
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not pwd_context.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غلط")

    token = create_token({"sub": user.username, "role": user.role, "user_id": user.id})
    return TokenResponse(
        access_token=token, role=user.role, display_name=user.display_name,
        branch_root_id=user.branch_root_id, user_id=user.id,
    )

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    if not write_limiter.is_allowed(f"register:{client_ip}"):
        raise HTTPException(status_code=429, detail="محاولات كثيرة — حاول بعد دقيقة")

    # Validate invitation
    invite = db.query(Invitation).filter(Invitation.code == payload.invite_code).first()
    if not invite:
        raise HTTPException(status_code=404, detail="كود الدعوة غير صالح")
    if invite.expires_at:
        exp = invite.expires_at.replace(tzinfo=timezone.utc) if invite.expires_at.tzinfo is None else invite.expires_at
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=410, detail="كود الدعوة منتهي الصلاحية")
    if invite.use_count >= invite.max_uses:
        raise HTTPException(status_code=410, detail="كود الدعوة وصل الحد الأقصى للاستخدام")

    # Check username uniqueness
    if payload.username == ADMIN_USERNAME:
        raise HTTPException(status_code=400, detail="اسم المستخدم محجوز")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="اسم المستخدم مستخدم بالفعل")

    # Create user
    user = User(
        username=payload.username,
        password_hash=pwd_context.hash(payload.password),
        display_name=payload.display_name,
        role="branch_editor",
        branch_root_id=invite.branch_root_id,
    )
    db.add(user)
    db.flush()

    # Update invitation usage
    invite.use_count += 1
    invite.used_by = user.id
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.username, "role": user.role, "user_id": user.id})
    return TokenResponse(
        access_token=token, role=user.role, display_name=user.display_name,
        branch_root_id=user.branch_root_id, user_id=user.id,
    )

@router.get("/me", response_model=UserResponse)
def get_me(user: dict = Depends(require_auth), db: Session = Depends(get_db)):
    """Get current user info."""
    if user.get("user_id"):
        db_user = db.query(User).filter(User.id == user["user_id"]).first()
        if db_user:
            return UserResponse.model_validate(db_user)
    # Built-in admin
    return UserResponse(id=0, username=user["username"], display_name="أدمن", role="admin")

@router.put("/users/{user_id}/password")
def update_user_password(user_id: int, payload: AdminPasswordReset, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Update a user's password. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    user.password_hash = pwd_context.hash(payload.new_password)
    db.commit()
    return {"message": "تم تغيير كلمة المرور بنجاح."}

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, payload: UserRoleUpdate, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Update a user's role or branch assignment. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    if payload.role is not None:
        user.role = payload.role
    if payload.branch_root_id is not None:
        user.branch_root_id = payload.branch_root_id
    elif "branch_root_id" in payload.model_dump(exclude_unset=True) and payload.branch_root_id is None:
        user.branch_root_id = None
        
    db.commit()
    return {"message": "تم تحديث بيانات المستخدم بنجاح"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Delete a user. Admin only."""
    # Prevent admin from deleting themselves if they are the logged in user
    if admin.get("user_id") == user_id:
        raise HTTPException(status_code=400, detail="لا يمكنك حذف حسابك الشخصي من هنا")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    # NEW: Clear references in other tables to avoid FK constraint errors
    db.query(AuditLog).filter(AuditLog.user_id == user_id).update({AuditLog.user_id: None})
    db.query(Invitation).filter(Invitation.created_by == user_id).update({Invitation.created_by: None})
    db.query(Invitation).filter(Invitation.used_by == user_id).update({Invitation.used_by: None})
    
    db.delete(user)
    db.commit()
    return {"message": "تم حذف المستخدم بنجاح."}

@router.post("/invitations", response_model=InvitationResponse)
def create_invitation(payload: InvitationCreate, request: Request, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Create a new invitation link. Admin only."""
    # Validate branch exists
    root = get_member_or_404(db, payload.branch_root_id)

    code = secrets.token_urlsafe(6)[:8]  # 8-char URL-safe code
    expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.expires_hours)

    invite = Invitation(
        code=code,
        branch_root_id=payload.branch_root_id,
        created_by=admin.get("user_id"),
        max_uses=payload.max_uses,
        expires_at=expires_at,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    # Build invite URL
    origin = request.headers.get("origin", request.headers.get("referer", ""))
    if origin:
        base = origin.rstrip("/")
    else:
        base = f"{request.url.scheme}://{request.url.netloc}"
    invite_url = f"{base}/#invite/{code}"

    return InvitationResponse(
        id=invite.id, code=invite.code, branch_root_id=invite.branch_root_id,
        branch_name=root.branch_name or root.full_name, max_uses=invite.max_uses,
        use_count=invite.use_count, expires_at=invite.expires_at,
        created_at=invite.created_at, invite_url=invite_url,
    )

@router.get("/invitations", response_model=List[InvitationResponse])
def list_invitations(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List all invitations. Admin only."""
    invites = db.query(Invitation).order_by(Invitation.created_at.desc()).all()
    result = []
    for inv in invites:
        root = db.query(FamilyMember).filter(FamilyMember.id == inv.branch_root_id).first()
        result.append(InvitationResponse(
            id=inv.id, code=inv.code, branch_root_id=inv.branch_root_id,
            branch_name=root.full_name if root else None,
            max_uses=inv.max_uses, use_count=inv.use_count,
            expires_at=inv.expires_at, created_at=inv.created_at,
        ))
    return result

@router.get("/invitations/{code}", response_model=InvitationPublic)
def get_invitation(code: str, db: Session = Depends(get_db)):
    """Public — get invitation info for registration page."""
    invite = db.query(Invitation).filter(Invitation.code == code).first()
    if not invite:
        raise HTTPException(status_code=404, detail="كود الدعوة غير موجود")

    is_valid = True
    if invite.expires_at:
        exp = invite.expires_at.replace(tzinfo=timezone.utc) if invite.expires_at.tzinfo is None else invite.expires_at
        if datetime.now(timezone.utc) > exp:
            is_valid = False
    if invite.use_count >= invite.max_uses:
        is_valid = False

    root = db.query(FamilyMember).filter(FamilyMember.id == invite.branch_root_id).first()

    return InvitationPublic(
        code=invite.code,
        branch_name=root.branch_name if root else None,
        branch_root_name=root.full_name if root else None,
        is_valid=is_valid,
    )

@router.delete("/invitations/{code}")
def delete_invitation(code: str, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Delete an invitation. Admin only."""
    invite = db.query(Invitation).filter(Invitation.code == code).first()
    if not invite:
        raise HTTPException(status_code=404, detail="كود الدعوة غير موجود")
    db.delete(invite)
    db.commit()
    return {"detail": "تم حذف الدعوة"}

@router.get("/users", response_model=List[UserResponse])
def list_users(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List all registered users. Admin only."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]
