import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from db import get_db
from models import Ambassador, AppSetting
from schemas import AmbassadorResponse, AmbassadorUpdate
from deps import require_admin, get_current_user, log_action, model_to_dict

router = APIRouter(tags=["Ambassadors"])

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
AMB_DIR = UPLOADS_DIR / "ambassadors"
AMB_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/ambassadors", response_model=List[AmbassadorResponse])
def list_ambassadors(user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all ambassadors. Non-admins only see visible ones."""
    is_admin = user is not None and user.get("role") == "admin"
    q = db.query(Ambassador).order_by(Ambassador.order.asc(), Ambassador.created_at.desc())
    if not is_admin:
        q = q.filter(Ambassador.is_visible == True)
    return q.all()

@router.post("/ambassadors", response_model=AmbassadorResponse)
def create_ambassador(
    name: str = Form(...),
    country: str = Form(...),
    years: Optional[int] = Form(None),
    is_visible: bool = Form(True),
    file: Optional[UploadFile] = File(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new ambassador. Admin only."""
    image_url = None
    if file:
        ext = Path(file.filename).suffix or ""
        filename = f"amb_{uuid.uuid4().hex[:8]}{ext}"
        dest = AMB_DIR / filename
        dest.write_bytes(file.file.read())
        image_url = f"/uploads/ambassadors/{filename}"
    
    amb = Ambassador(
        name=name,
        country=country,
        years=years,
        image_url=image_url,
        is_visible=is_visible
    )
    db.add(amb)
    db.commit()
    db.refresh(amb)
    log_action(db, admin, "CREATE", "ambassadors", amb.id, new_values=model_to_dict(amb))
    return amb

@router.put("/ambassadors/{amb_id}", response_model=AmbassadorResponse)
def update_ambassador(
    amb_id: int,
    name: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    years: Optional[int] = Form(None),
    is_visible: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an ambassador. Admin only."""
    amb = db.query(Ambassador).filter(Ambassador.id == amb_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambassador not found")
    
    old_val = model_to_dict(amb)
    if name is not None: amb.name = name
    if country is not None: amb.country = country
    if years is not None: amb.years = years
    if is_visible is not None: amb.is_visible = is_visible

    if file:
        # Delete old file if exists
        if amb.image_url:
            old_filename = amb.image_url.split("/")[-1]
            old_path = AMB_DIR / old_filename
            if old_path.exists():
                old_path.unlink(missing_ok=True)
        
        # Save new file
        ext = Path(file.filename).suffix or ""
        new_filename = f"amb_{uuid.uuid4().hex[:8]}{ext}"
        dest = AMB_DIR / new_filename
        dest.write_bytes(file.file.read())
        amb.image_url = f"/uploads/ambassadors/{new_filename}"
        
    db.commit()
    db.refresh(amb)
    log_action(db, admin, "UPDATE", "ambassadors", amb.id, old_values=old_val, new_values=model_to_dict(amb))
    return amb

@router.delete("/ambassadors/{amb_id}")
def delete_ambassador(amb_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Delete an ambassador. Admin only."""
    amb = db.query(Ambassador).filter(Ambassador.id == amb_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambassador not found")
        
    if amb.image_url:
        filename = amb.image_url.split("/")[-1]
        path = AMB_DIR / filename
        if path.exists():
            path.unlink(missing_ok=True)
            
    old_val = model_to_dict(amb)
    db.delete(amb)
    db.commit()
    log_action(db, admin, "DELETE", "ambassadors", amb_id, old_values=old_val)
    return {"message": "Ambassador deleted"}

@router.get("/ambassadors/stats")
def get_ambassador_stats(db: Session = Depends(get_db)):
    """Get global ambassador stats."""
    total_ambassadors = db.query(AppSetting).filter(AppSetting.key == "total_ambassadors").first()
    total_countries = db.query(AppSetting).filter(AppSetting.key == "total_countries").first()
    
    return {
        "total_ambassadors": total_ambassadors.value if total_ambassadors else "0",
        "total_countries": total_countries.value if total_countries else "0"
    }

@router.post("/ambassadors/stats")
def update_ambassador_stats(
    total_ambassadors: str = Form(...),
    total_countries: str = Form(...),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update global ambassador stats. Admin only."""
    for key, val in [("total_ambassadors", total_ambassadors), ("total_countries", total_countries)]:
        setting = db.query(AppSetting).filter(AppSetting.key == key).first()
        old_val = {"value": setting.value} if setting else None
        if setting:
            setting.value = val
        else:
            setting = AppSetting(key=key, value=val)
            db.add(setting)
        
        log_action(db, admin, "UPDATE_STATS", "app_settings", key, old_values=old_val, new_values={"value": val})
    
    db.commit()
    return {"message": "Stats updated"}
