from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from datetime import datetime

from db import get_db
from models import AuditLog, FamilyMember, AppSetting
from schemas import AuditLogResponse, RevertRequest, StatsResponse
from deps import (
    require_admin, log_action, get_app_setting, 
    MAX_LINEAGE_DEPTH
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
