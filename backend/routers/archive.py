import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from db import get_db
from models import ArchiveItem, Story
from schemas import (
    ArchiveItemResponse, ArchiveItemUpdate,
    StoryResponse, StoryCreate, StoryUpdate, StoryReorderRequest
)
from deps import (
    require_admin, get_current_user, log_action, model_to_dict
)

router = APIRouter(tags=["Archive"])

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
ARCHIVE_DIR = UPLOADS_DIR / "archive"
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/archive", response_model=List[ArchiveItemResponse])
def list_archive(category: Optional[str] = None, user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    """List items in the family archive."""
    is_admin = user is not None and user.get("role") == "admin"
    q = db.query(ArchiveItem).order_by(ArchiveItem.created_at.desc())
    if category:
        q = q.filter(ArchiveItem.category == category)
    if not is_admin:
        q = q.filter(ArchiveItem.is_visible == True)
    return [ArchiveItemResponse.model_validate(item) for item in q.all()]

@router.post("/archive", response_model=ArchiveItemResponse)
def upload_archive_item(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    is_visible: bool = Form(False),
    file: UploadFile = File(...),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add a new item to the family archive. Admin only."""
    ext = Path(file.filename).suffix or ""
    # Support for multiple file types
    if ext.lower() in [".pdf", ".doc", ".docx"]:
        file_type = "document"
    elif ext.lower() in [".mp4", ".mov", ".avi"]:
        file_type = "video"
    elif ext.lower() in [".mp3", ".wav", ".m4a"]:
        file_type = "audio"
    else:
        file_type = "image"
    filename = f"arch_{uuid.uuid4().hex[:8]}{ext}"
    dest = ARCHIVE_DIR / filename
    
    # Ensure binary read
    contents = file.file.read()
    dest.write_bytes(contents)
    
    item = ArchiveItem(
        title=title,
        description=description,
        file_url=f"/uploads/archive/{filename}",
        file_type=file_type,
        category=category,
        is_visible=is_visible
    )
    db.add(item)
    db.flush()
    log_action(db, admin, "CREATE", "archive_items", item.id, new_values=model_to_dict(item))
    db.commit()
    db.refresh(item)
    return ArchiveItemResponse.model_validate(item)

@router.put("/archive/{item_id}", response_model=ArchiveItemResponse)
def update_archive_item(
    item_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_visible: Optional[bool] = Form(None),
    file: Optional[UploadFile] = File(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an archive item's metadata and optionally its file. Admin only."""
    item = db.query(ArchiveItem).filter(ArchiveItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    old_val = model_to_dict(item)
    if title is not None: item.title = title
    if description is not None: item.description = description
    if category is not None: item.category = category
    if is_visible is not None: item.is_visible = is_visible

    if file:
        # Delete old file
        if item.file_url:
            filename = item.file_url.split("/")[-1]
            old_path = ARCHIVE_DIR / filename
            if old_path.exists():
                old_path.unlink(missing_ok=True)
        
        # Save new file
        ext = Path(file.filename).suffix or ""
        if ext.lower() in [".pdf", ".doc", ".docx"]:
            file_type = "document"
        elif ext.lower() in [".mp4", ".mov", ".avi"]:
            file_type = "video"
        elif ext.lower() in [".mp3", ".wav", ".m4a"]:
            file_type = "audio"
        else:
            file_type = "image"
        new_filename = f"arch_{uuid.uuid4().hex[:8]}{ext}"
        dest = ARCHIVE_DIR / new_filename
        dest.write_bytes(file.file.read())
        
        item.file_url = f"/uploads/archive/{new_filename}"
        item.file_type = file_type
        
    log_action(db, admin, "UPDATE", "archive_items", item.id, old_values=old_val, new_values=model_to_dict(item))
    db.commit()
    db.refresh(item)
    return ArchiveItemResponse.model_validate(item)

@router.delete("/archive/{item_id}")
def delete_archive_item(item_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Remove an item from the archive. Admin only."""
    item = db.query(ArchiveItem).filter(ArchiveItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if item.file_url:
        # Extract filename from URL
        filename = item.file_url.split("/")[-1]
        old_path = ARCHIVE_DIR / filename
        if old_path.exists():
            old_path.unlink(missing_ok=True)
            
    old_val = model_to_dict(item)
    db.delete(item)
    log_action(db, admin, "DELETE", "archive_items", item_id, old_values=old_val)
    db.commit()
    return {"message": "Deleted successfully"}


# ── Stories ───────────────────────────────────────────────────────────────────

@router.get("/stories", response_model=List[StoryResponse])
def list_stories(user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all stories. Non-admins only see visible ones, ordered by 'order' then 'created_at'."""
    is_admin = user is not None and user.get("role") == "admin"
    q = db.query(Story).order_by(Story.order.asc(), Story.created_at.desc())
    if not is_admin:
        q = q.filter(Story.is_visible == True)
    return q.all()

@router.post("/stories", response_model=StoryResponse)
def create_story(payload: StoryCreate, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Create a new story. Admin only."""
    story = Story(**payload.model_dump())
    db.add(story)
    db.flush()
    log_action(db, admin, "CREATE_STORY", "stories", story.id, new_values=model_to_dict(story))
    db.commit()
    db.refresh(story)
    return story

@router.put("/stories/{story_id}", response_model=StoryResponse)
def update_story(story_id: int, payload: StoryUpdate, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Update a story. Admin only."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    old_val = model_to_dict(story)
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(story, k, v)
        
    log_action(db, admin, "UPDATE_STORY", "stories", story.id, old_values=old_val, new_values=model_to_dict(story))
    db.commit()
    db.refresh(story)
    return story

@router.delete("/stories/{story_id}")
def delete_story(story_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Delete a story. Admin only."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    old_val = model_to_dict(story)
    db.delete(story)
    log_action(db, admin, "DELETE_STORY", "stories", story_id, old_values=old_val)
    db.commit()
    return {"message": "Story deleted"}

@router.patch("/stories/reorder")
def reorder_stories(payload: StoryReorderRequest, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """Bulk update story orders based on a list of IDs. Admin only."""
    for idx, story_id in enumerate(payload.story_ids):
        db.query(Story).filter(Story.id == story_id).update({Story.order: idx})
    db.commit()
    return {"message": "Order updated"}
