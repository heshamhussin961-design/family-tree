from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Form
from sqlalchemy.orm import Session

from db import get_db
from models import Competition, CompetitionResult, AppSetting
from schemas import (
    CompetitionResponse, CompetitionCreate, CompetitionUpdate,
    CompetitionResultResponse, CompetitionResultCreate, CompetitionResultUpdate
)
from deps import require_admin, get_current_user, log_action, model_to_dict

router = APIRouter(tags=["Competitions"])

# ── Competitions ──────────────────────────────────────────────────────────────

@router.get("/competitions", response_model=List[CompetitionResponse])
def list_competitions(user: Optional[dict] = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all competitions. Non-admins only see active ones."""
    is_admin = user is not None and user.get("role") == "admin"
    q = db.query(Competition).order_by(Competition.order.asc(), Competition.created_at.desc())
    if not is_admin:
        q = q.filter(Competition.is_active == True)
    return q.all()

@router.post("/competitions", response_model=CompetitionResponse)
def create_competition(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    is_active: bool = Form(True),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    comp = Competition(title=title, description=description, is_active=is_active)
    db.add(comp)
    db.commit()
    db.refresh(comp)
    log_action(db, admin, "CREATE", "competitions", comp.id, new_values=model_to_dict(comp))
    return comp

@router.put("/competitions/{comp_id}", response_model=CompetitionResponse)
def update_competition(
    comp_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    comp = db.query(Competition).filter(Competition.id == comp_id).first()
    if not comp: raise HTTPException(status_code=404, detail="Competition not found")
    
    old_val = model_to_dict(comp)
    if title is not None: comp.title = title
    if description is not None: comp.description = description
    if is_active is not None: comp.is_active = is_active
    
    db.commit()
    db.refresh(comp)
    log_action(db, admin, "UPDATE", "competitions", comp.id, old_values=old_val, new_values=model_to_dict(comp))
    return comp

@router.delete("/competitions/{comp_id}")
def delete_competition(comp_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    comp = db.query(Competition).filter(Competition.id == comp_id).first()
    if not comp: raise HTTPException(status_code=404, detail="Competition not found")
    
    old_val = model_to_dict(comp)
    db.delete(comp)
    db.commit()
    log_action(db, admin, "DELETE", "competitions", comp_id, old_values=old_val)
    return {"message": "Competition deleted"}

# ── Results ───────────────────────────────────────────────────────────────────

@router.get("/competitions/results", response_model=List[CompetitionResultResponse])
def list_results(competition_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(CompetitionResult).order_by(CompetitionResult.year.desc(), CompetitionResult.created_at.desc())
    if competition_id:
        q = q.filter(CompetitionResult.competition_id == competition_id)
    return q.all()

@router.post("/competitions/results", response_model=CompetitionResultResponse)
def create_result(
    competition_id: int = Form(...),
    member_name: str = Form(...),
    member_id: Optional[int] = Form(None),
    status: str = Form("candidate"),
    reward: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    res = CompetitionResult(
        competition_id=competition_id, member_name=member_name, member_id=member_id,
        status=status, reward=reward, year=year, notes=notes
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    log_action(db, admin, "CREATE", "competition_results", res.id, new_values=model_to_dict(res))
    return res

@router.put("/competitions/results/{result_id}", response_model=CompetitionResultResponse)
def update_result(
    result_id: int,
    competition_id: Optional[int] = Form(None),
    member_name: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    reward: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    res = db.query(CompetitionResult).filter(CompetitionResult.id == result_id).first()
    if not res: raise HTTPException(status_code=404, detail="Result not found")
    
    old_val = model_to_dict(res)
    if competition_id is not None: res.competition_id = competition_id
    if member_name is not None: res.member_name = member_name
    if status is not None: res.status = status
    if reward is not None: res.reward = reward
    if year is not None: res.year = year
    if notes is not None: res.notes = notes
    
    db.commit()
    db.refresh(res)
    log_action(db, admin, "UPDATE", "competition_results", res.id, old_values=old_val, new_values=model_to_dict(res))
    return res

@router.delete("/competitions/results/{result_id}")
def delete_result(result_id: int, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    res = db.query(CompetitionResult).filter(CompetitionResult.id == result_id).first()
    if not res: raise HTTPException(status_code=404, detail="Result not found")
    
    old_val = model_to_dict(res)
    db.delete(res)
    db.commit()
    log_action(db, admin, "DELETE", "competition_results", result_id, old_values=old_val)
    return {"message": "Result deleted"}

# ── Page Settings ─────────────────────────────────────────────────────────────

@router.get("/competitions/settings")
def get_comp_settings(db: Session = Depends(get_db)):
    keys = ["comp_intro_title", "comp_goal", "comp_organization"]
    settings = db.query(AppSetting).filter(AppSetting.key.in_(keys)).all()
    res = {s.key: s.value for s in settings}
    return {
        "comp_intro_title": res.get("comp_intro_title", "برنامج جوائز أبناء العائلة"),
        "comp_goal": res.get("comp_goal", "تشجيع أبناء وأحفاد العائلة على التفوق في مجالات الدين والعلم والأخلاق، وتعزيز روح التنافس الإيجابي بينهم."),
        "comp_organization": res.get("comp_organization", "تشكيل لجنة من العائلة مختصة بهذا الشأن، مهتمتها الإشراف والمتابعة...")
    }

@router.post("/competitions/settings")
def update_comp_settings(
    title: Optional[str] = Form(None),
    goal: Optional[str] = Form(None),
    organization: Optional[str] = Form(None),
    admin: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    updates = {
        "comp_intro_title": title,
        "comp_goal": goal,
        "comp_organization": organization
    }
    for key, val in updates.items():
        if val is None: continue
        setting = db.query(AppSetting).filter(AppSetting.key == key).first()
        if setting:
            setting.value = val
        else:
            db.add(AppSetting(key=key, value=val))
    
    db.commit()
    return {"message": "Settings updated"}
