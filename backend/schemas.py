from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class FamilyMemberBase(BaseModel):
    id:           int
    full_name:    str
    branch_name:  Optional[str] = None
    parent_id:    Optional[int] = None
    image_url:    Optional[str] = None
    gender:       Optional[str] = None
    birth_year:   Optional[int] = None
    birth_month:  Optional[int] = None
    birth_day:    Optional[int] = None
    death_year:   Optional[int] = None
    death_month:  Optional[int] = None
    death_day:    Optional[int] = None
    email:        Optional[str] = None
    phone:        Optional[str] = None
    is_alive:     bool = True
    is_approved:       bool = True
    birth_place:       Optional[str]  = None
    residence_place:   Optional[str]  = None

    blood_type:        Optional[str]  = None
    profession:        Optional[str]  = None
    university_degree: Optional[str]  = None
    job_title:         Optional[str]  = None
    is_student:        bool           = False
    looking_for_job:   bool           = False
    is_public:         bool           = True
    marital_status:    Optional[str]  = None
    mother_name:       Optional[str]  = None
    biography:         Optional[str]  = None

    model_config = {"from_attributes": True}


class SearchResult(FamilyMemberBase):
    pass



class SpouseBase(BaseModel):
    full_name:    str
    birth_year:   Optional[int] = None
    birth_month:  Optional[int] = None
    birth_day:    Optional[int] = None
    birth_place:  Optional[str] = None
    phone:        Optional[str] = None
    email:        Optional[str] = None
    profession:   Optional[str] = None
    notes:        Optional[str] = None

class SpouseCreate(SpouseBase):
    pass

class SpouseResponse(SpouseBase):
    id: int
    member_id: int
    model_config = {"from_attributes": True}

class FamilyMemberDetail(FamilyMemberBase):
    spouses: List[SpouseResponse] = []

class LineageResponse(BaseModel):
    person:  FamilyMemberDetail
    lineage: List[SearchResult]


class FamilyMemberCreate(BaseModel):
    full_name:    str           = Field(..., min_length=2, max_length=120)
    branch_name:  Optional[str] = Field(None, max_length=80)
    parent_id:    Optional[int] = Field(None, ge=1)
    gender:       Optional[str] = Field(None, pattern="^(male|female)$")
    birth_year:   Optional[int] = Field(None, ge=1, le=2100)
    birth_month:  Optional[int] = Field(None, ge=1, le=12)
    birth_day:    Optional[int] = Field(None, ge=1, le=31)
    death_year:   Optional[int] = Field(None, ge=1, le=2100)
    death_month:  Optional[int] = Field(None, ge=1, le=12)
    death_day:    Optional[int] = Field(None, ge=1, le=31)
    email:        Optional[str] = Field(None, max_length=120)
    phone:        Optional[str] = Field(None, max_length=30)
    is_alive:     bool          = True
    blood_type:        Optional[str]  = Field(None, max_length=8)
    profession:        Optional[str]  = Field(None, max_length=120)
    university_degree: Optional[str]  = Field(None, max_length=120)
    job_title:         Optional[str]  = Field(None, max_length=120)
    is_student:        bool           = False
    looking_for_job:   bool           = False
    birth_place:       Optional[str]  = Field(None, max_length=120)
    residence_place:   Optional[str]  = Field(None, max_length=120)

    is_public:         bool           = True
    marital_status:    Optional[str]  = Field(None, max_length=50)
    mother_name:       Optional[str]  = Field(None, max_length=120)
    biography:         Optional[str]  = Field(None, max_length=5000)
    spouses:           List[SpouseCreate] = []


class FamilyMemberUpdate(BaseModel):
    """All fields optional — only provided fields get updated."""
    full_name:         Optional[str]  = Field(None, min_length=2, max_length=120)
    branch_name:       Optional[str]  = Field(None, max_length=80)
    parent_id:         Optional[int]  = None
    gender:            Optional[str]  = Field(None, pattern="^(male|female)$")
    birth_year:        Optional[int]  = Field(None, ge=1, le=2100)
    birth_month:       Optional[int]  = Field(None, ge=1, le=12)
    birth_day:         Optional[int]  = Field(None, ge=1, le=31)
    death_year:        Optional[int]  = Field(None, ge=1, le=2100)
    death_month:       Optional[int]  = Field(None, ge=1, le=12)
    death_day:         Optional[int]  = Field(None, ge=1, le=31)
    email:             Optional[str]  = Field(None, max_length=120)
    phone:             Optional[str]  = Field(None, max_length=30)
    is_alive:          Optional[bool] = None
    blood_type:        Optional[str]  = Field(None, max_length=8)
    profession:        Optional[str]  = Field(None, max_length=120)
    university_degree: Optional[str]  = Field(None, max_length=120)
    job_title:         Optional[str]  = Field(None, max_length=120)
    is_student:        Optional[bool] = None
    looking_for_job:   Optional[bool] = None
    birth_place:       Optional[str]  = Field(None, max_length=120)
    residence_place:   Optional[str]  = Field(None, max_length=120)

    is_public:         Optional[bool] = None
    marital_status:    Optional[str]  = Field(None, max_length=50)
    mother_name:       Optional[str]  = Field(None, max_length=120)
    biography:         Optional[str]  = Field(None, max_length=5000)


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         str = "branch_editor"
    display_name: Optional[str] = None
    branch_root_id: Optional[int] = None
    user_id:      Optional[int] = None


class RegisterRequest(BaseModel):
    invite_code:   str  = Field(..., min_length=4, max_length=32)
    username:      str  = Field(..., min_length=3, max_length=50)
    password:      str  = Field(..., min_length=6, max_length=100)
    display_name:  str  = Field(..., min_length=2, max_length=80)


# ── Stats ─────────────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total:       int
    living:      int
    deceased:    int
    generations: int


# ── Invitations ───────────────────────────────────────────────────────────────

class InvitationCreate(BaseModel):
    branch_root_id: int = Field(..., ge=1)
    max_uses:       int = Field(1, ge=1, le=100)
    expires_hours:  int = Field(168, ge=1, le=8760)  # default 7 days, max 1 year


class InvitationResponse(BaseModel):
    id:             int
    code:           str
    branch_root_id: int
    branch_name:    Optional[str] = None
    max_uses:       int
    use_count:      int
    expires_at:     Optional[datetime] = None
    created_at:     Optional[datetime] = None
    invite_url:     Optional[str] = None

    model_config = {"from_attributes": True}


class InvitationPublic(BaseModel):
    """Public info shown on registration page — no sensitive data."""
    code:           str
    branch_name:    Optional[str] = None
    branch_root_name: Optional[str] = None
    is_valid:       bool = True


# ── User ──────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id:             int
    username:       str
    display_name:   str
    role:           str
    branch_root_id: Optional[int] = None
    member_id:      Optional[int] = None
    created_at:     Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserRoleUpdate(BaseModel):
    role:           Optional[str] = None
    branch_root_id: Optional[int] = None


class AdminPasswordReset(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=100)


# ── Archive ───────────────────────────────────────────────────────────────────

class ArchiveItemResponse(BaseModel):
    id:          int
    title:       str
    description: Optional[str] = None
    file_url:    str
    file_type:   str
    category:    str
    is_visible:  bool = False
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}


class ArchiveItemUpdate(BaseModel):
    title:       Optional[str] = None
    description: Optional[str] = None
    category:    Optional[str] = None
    is_visible:  Optional[bool] = None


# ── Audit Logs ───────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id:           int
    user_id:      Optional[int] = None
    username:     Optional[str] = None
    action:       str
    target_table: str
    target_id:    int
    old_values:   Optional[dict] = None
    new_values:   Optional[dict] = None
    timestamp:    datetime

    model_config = {"from_attributes": True}


class RevertRequest(BaseModel):
    log_id: int


# ── Stories ───────────────────────────────────────────────────────────────────

class StoryBase(BaseModel):
    title:       str
    content:     str
    order:       int = 0
    is_visible:  bool = True

class StoryCreate(StoryBase):
    pass

class StoryUpdate(BaseModel):
    title:       Optional[str] = None
    content:     Optional[str] = None
    order:       Optional[int] = None
    is_visible:  Optional[bool] = None

class StoryResponse(StoryBase):
    id:          int
    created_at:  datetime

    model_config = {"from_attributes": True}

class StoryReorderRequest(BaseModel):
    story_ids: List[int] # List of IDs in the desired order


# ── Ambassadors ───────────────────────────────────────────────────────────────

class AmbassadorBase(BaseModel):
    name:        str
    country:     str
    years:       Optional[int] = None
    is_visible:  bool = True
    order:       int = 0

class AmbassadorCreate(AmbassadorBase):
    pass

class AmbassadorUpdate(BaseModel):
    name:        Optional[str] = None
    country:     Optional[str] = None
    years:       Optional[int] = None
    is_visible:  Optional[bool] = None
    order:       Optional[int] = None

class AmbassadorResponse(AmbassadorBase):
    id:          int
    image_url:   Optional[str] = None
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── Competitions ──────────────────────────────────────────────────────────────

class CompetitionBase(BaseModel):
    title:       str
    description: Optional[str] = None
    is_active:   bool = True
    order:       int = 0

class CompetitionCreate(CompetitionBase):
    pass

class CompetitionUpdate(BaseModel):
    title:       Optional[str] = None
    description: Optional[str] = None
    is_active:   Optional[bool] = None
    order:       Optional[int] = None

class CompetitionResponse(CompetitionBase):
    id:          int
    created_at:  datetime
    model_config = {"from_attributes": True}


class CompetitionResultBase(BaseModel):
    competition_id: int
    member_name:    str
    member_id:      Optional[int] = None
    status:         str = "candidate"
    reward:         Optional[str] = None
    year:           Optional[int] = None
    notes:          Optional[str] = None

class CompetitionResultCreate(CompetitionResultBase):
    pass

class CompetitionResultUpdate(BaseModel):
    competition_id: Optional[int] = None
    member_name:    Optional[str] = None
    member_id:      Optional[int] = None
    status:         Optional[str] = None
    reward:         Optional[str] = None
    year:           Optional[int] = None
    notes:          Optional[str] = None

class CompetitionResultResponse(CompetitionResultBase):
    id:          int
    created_at:  datetime
    model_config = {"from_attributes": True}


# ── Heritage ─────────────────────────────────────────────────────────────────

class HeritageBase(BaseModel):
    section_key:  str
    type:         str
    title:        str
    subtitle:     Optional[str] = None
    content:      dict # Flexible JSON
    icon:         Optional[str] = None
    order:        int = 0
    is_visible:   bool = True

class HeritageCreate(HeritageBase):
    pass

class HeritageUpdate(BaseModel):
    section_key:  Optional[str] = None
    type:         Optional[str] = None
    title:        Optional[str] = None
    subtitle:     Optional[str] = None
    content:      Optional[dict] = None
    icon:         Optional[str] = None
    order:        Optional[int] = None
    is_visible:   Optional[bool] = None

class HeritageResponse(HeritageBase):
    id:          int
    created_at:  datetime

    model_config = {"from_attributes": True}
