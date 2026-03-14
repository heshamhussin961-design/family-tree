from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from db import get_db
from models import Heritage
from schemas import HeritageResponse, HeritageCreate, HeritageUpdate
from deps import require_admin, log_action, model_to_dict

router = APIRouter(tags=["Heritage"])

@router.get("/heritage", response_model=List[HeritageResponse])
def list_heritage(db: Session = Depends(get_db)):
    """List all heritage sections. Non-visible ones are hidden for public."""
    return db.query(Heritage).filter(Heritage.is_visible == True).order_by(Heritage.order.asc()).all()

@router.get("/admin/heritage", response_model=List[HeritageResponse])
def admin_list_heritage(admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List all heritage sections including hidden ones. Admin only."""
    return db.query(Heritage).order_by(Heritage.order.asc()).all()

@router.post("/heritage", response_model=HeritageResponse)
def create_heritage_section(
    data: HeritageCreate,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new heritage section. Admin only."""
    # Check if section_key is unique
    existing = db.query(Heritage).filter(Heritage.section_key == data.section_key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Section key already exists")
    
    section = Heritage(**data.model_dump())
    db.add(section)
    db.flush()
    log_action(db, admin, "CREATE", "heritage", section.id, new_values=model_to_dict(section))
    db.commit()
    db.refresh(section)
    return section

@router.put("/heritage/{section_id}", response_model=HeritageResponse)
def update_heritage_section(
    section_id: int,
    data: HeritageUpdate,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a heritage section. Admin only."""
    section = db.query(Heritage).filter(Heritage.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    old_val = model_to_dict(section)
    update_data = data.model_dump(exclude_unset=True)
    
    # Check if section_key is being changed and if it's unique
    if "section_key" in update_data and update_data["section_key"] != section.section_key:
        existing = db.query(Heritage).filter(Heritage.section_key == update_data["section_key"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Section key already exists")

    for key, value in update_data.items():
        setattr(section, key, value)
        
    log_action(db, admin, "UPDATE", "heritage", section.id, old_values=old_val, new_values=model_to_dict(section))
    db.commit()
    db.refresh(section)
    return section

@router.delete("/heritage/{section_id}")
def delete_heritage_section(
    section_id: int,
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a heritage section. Admin only."""
    section = db.query(Heritage).filter(Heritage.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
        
    old_val = model_to_dict(section)
    db.delete(section)
    log_action(db, admin, "DELETE", "heritage", section_id, old_values=old_val)
    db.commit()
    return {"message": "Section deleted"}
