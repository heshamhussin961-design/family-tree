from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from datetime import datetime

from db import get_db
from models import AuditLog, FamilyMember, AppSetting, PendingModification, Spouse
from schemas import AuditLogResponse, RevertRequest, StatsResponse, AdminPasswordReset
from deps import (
    require_admin, log_action, get_app_setting, pwd_context,
    MAX_LINEAGE_DEPTH, model_to_dict
)
from gedcom_utils import generate_gedcom

router = APIRouter(tags=["Admin & Settings"])

@router.get("/admin/logs", response_model=List[AuditLogResponse])
def list_audit_logs(limit: int = Query(50, ge=1, le=200), admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List recent audit logs. Admin only."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.post("/admin/revert")
def revert_action(payload: RevertRequest, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Revert a change based on an audit log entry. Admin only."""
    log = db.query(AuditLog).filter(AuditLog.id == payload.log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="السجل غير موجود")

    if log.target_table != "family_members":
        raise HTTPException(status_code=400, detail="التراجع مدعوم حالياً لأعضاء العائلة فقط")

    member = db.query(FamilyMember).filter(FamilyMember.id == log.target_id).first()

    if log.action == "CREATE":
        if member:
            db.delete(member)
        else:
            raise HTTPException(status_code=404, detail="العضو غير موجود بالفعل")
    
    elif log.action == "UPDATE" or log.action == "APPROVE":
        if not member:
            raise HTTPException(status_code=404, detail="العضو غير موجود للتعديل")
        if not log.old_values:
            raise HTTPException(status_code=400, detail="لا توجد بيانات قديمة للتراجع عنها")
        
        for k, v in log.old_values.items():
            if hasattr(member, k) and k != "id":
                setattr(member, k, v)
    
    elif log.action == "DELETE":
        if member:
            raise HTTPException(status_code=400, detail="العضو موجود بالفعل")
        if not log.old_values:
            raise HTTPException(status_code=400, detail="لا توجد بيانات قديمة لاستعادتها")
        
        restored_member = FamilyMember(**log.old_values)
        db.add(restored_member)
    
    # Log the revert action itself
    log_action(db, admin, f"REVERT:{log.id}", log.target_table, log.target_id)
    
    db.commit()
    return {"message": "تم التراجع بنجاح"}

@router.get("/settings/{key}")
def get_setting(key: str, db: Session = Depends(get_db)):
    """Get a specific application setting."""
    val = get_app_setting(db, key)
    return {"key": key, "value": val}

@router.post("/settings")
def set_setting(payload: dict, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Update or create an application setting. Admin only."""
    key = payload.get("key")
    value = str(payload.get("value"))
    setting = db.query(AppSetting).filter(AppSetting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = AppSetting(key=key, value=value)
        db.add(setting)
    db.commit()
    return {"key": key, "value": value}

@router.put("/admin/system-password")
def change_system_password(payload: AdminPasswordReset, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Change the master admin password. Admin only."""
    hashed = pwd_context.hash(payload.new_password)
    setting = db.query(AppSetting).filter(AppSetting.key == "ADMIN_PASSWORD_HASH").first()
    if setting:
        setting.value = hashed
    else:
        setting = AppSetting(key="ADMIN_PASSWORD_HASH", value=hashed)
        db.add(setting)
    db.commit()
    return {"message": "تم تغيير كلمة مرور الأدمن بنجاح"}

@router.get("/admin/pending_modifications")
def get_pending_modifications(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List all pending edit requests."""
    mods = db.query(PendingModification).filter(PendingModification.status == "pending").order_by(PendingModification.created_at.desc()).all()
    result = []
    for m in mods:
        # Get target member info for display context
        member = None
        if m.action == "DELETE_SPOUSE" or m.action == "ADD_SPOUSE":
            member = db.query(FamilyMember).filter(FamilyMember.id == m.target_id).first()
        elif m.action == "UPDATE_MEMBER":
            member = db.query(FamilyMember).filter(FamilyMember.id == m.target_id).first()
            
        result.append({
            "id": m.id,
            "action": m.action,
            "target_id": m.target_id,
            "changes": m.changes,
            "requested_by": m.requested_by,
            "status": m.status,
            "created_at": m.created_at.isoformat(),
            "target_name": member.full_name if member else "غير معروف"
        })
    return result

@router.put("/admin/pending_modifications/{mod_id}/approve")
def approve_pending_modification(mod_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Approve and apply a pending modification."""
    mod = db.query(PendingModification).filter(PendingModification.id == mod_id).first()
    if not mod or mod.status != "pending":
        raise HTTPException(status_code=404, detail="الطلب غير موجود أو تمت معالجته مسبقاً")

    if mod.action == "UPDATE_MEMBER":
        member = db.query(FamilyMember).filter(FamilyMember.id == mod.target_id).first()
        if not member:
            mod.status = "rejected"
            db.commit()
            raise HTTPException(status_code=404, detail="العضو غير موجود")
        old_val = model_to_dict(member)
        for field, value in mod.changes.items():
            setattr(member, field, value)
        log_action(db, admin, "APPROVE_UPDATE", "family_members", member.id, old_values=old_val, new_values=model_to_dict(member))
        
    elif mod.action == "ADD_SPOUSE":
        member = db.query(FamilyMember).filter(FamilyMember.id == mod.target_id).first()
        if not member:
            mod.status = "rejected"
            db.commit()
            raise HTTPException(status_code=404, detail="العضو غير موجود")
        spouse = Spouse(**mod.changes, member_id=mod.target_id)
        db.add(spouse)
        db.flush()
        log_action(db, admin, "APPROVE_ADD_SPOUSE", "spouses", spouse.id, new_values=model_to_dict(spouse))
        
    elif mod.action == "DELETE_SPOUSE":
        spouse_id = mod.changes.get("spouse_id")
        spouse = db.query(Spouse).filter(Spouse.id == spouse_id).first()
        if not spouse:
            mod.status = "rejected"
            db.commit()
            raise HTTPException(status_code=404, detail="الزوجة غير موجودة")
        old_val = model_to_dict(spouse)
        db.delete(spouse)
        log_action(db, admin, "APPROVE_DELETE_SPOUSE", "spouses", spouse_id, old_values=old_val)

    mod.status = "approved"
    db.commit()
    return {"message": "تمت الموافقة وتطبيق التعديل بنجاح"}

@router.put("/admin/pending_modifications/{mod_id}/reject")
def reject_pending_modification(mod_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Reject a pending modification."""
    mod = db.query(PendingModification).filter(PendingModification.id == mod_id).first()
    if not mod or mod.status != "pending":
        raise HTTPException(status_code=404, detail="الطلب غير موجود أو تمت معالجته مسبقاً")

    mod.status = "rejected"
    db.commit()
    return {"message": "تم رفض طلب التعديل"}

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get general statistics about the family tree."""
    total = db.query(func.count(FamilyMember.id)).scalar() or 0
    living = db.query(func.count(FamilyMember.id)).filter(FamilyMember.is_alive == True).scalar() or 0
    deceased = total - living
    
    gen_query = text("""
        WITH RECURSIVE gen(id, depth) AS (
            SELECT id, 1 FROM family_members WHERE parent_id IS NULL
            UNION ALL
            SELECT fm.id, g.depth + 1 FROM family_members fm
            JOIN gen g ON fm.parent_id = g.id WHERE g.depth < :max_depth
        )
        SELECT COALESCE(MAX(depth), 0) FROM gen
    """)
    generations = db.execute(gen_query, {"max_depth": MAX_LINEAGE_DEPTH}).scalar() or 0
    
    return StatsResponse(total=total, living=living, deceased=deceased, generations=generations)

@router.get("/export/gedcom")
def export_gedcom(db: Session = Depends(get_db)):
    """Export the entire approved family tree in GEDCOM 5.5.1 format."""
    members = db.query(FamilyMember).filter(FamilyMember.is_approved == True).all()
    gedcom_str = generate_gedcom(members)
    
    filename = f"family_tree_{datetime.now().strftime('%Y%m%d')}.ged"
    return Response(
        content=gedcom_str,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
