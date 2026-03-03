from typing import Optional, List
from pydantic import BaseModel, Field


class FamilyMemberBase(BaseModel):
    id:           int
    full_name:    str
    branch_name:  Optional[str] = None
    parent_id:    Optional[int] = None
    image_url:    Optional[str] = None
    gender:       Optional[str] = None
    birth_year:   Optional[int] = None
    death_year:   Optional[int] = None
    email:        Optional[str] = None
    phone:        Optional[str] = None
    is_alive:     bool = True
    blood_type:        Optional[str]  = None
    profession:        Optional[str]  = None
    university_degree: Optional[str]  = None
    job_title:         Optional[str]  = None
    is_student:        bool           = False
    looking_for_job:   bool           = False

    model_config = {"from_attributes": True}


class FamilyMemberDetail(FamilyMemberBase):
    pass


class SearchResult(FamilyMemberBase):
    pass


class LineageResponse(BaseModel):
    person:  FamilyMemberDetail
    lineage: List[SearchResult]


class FamilyMemberCreate(BaseModel):
    full_name:    str           = Field(..., min_length=2, max_length=120)
    branch_name:  Optional[str] = Field(None, max_length=80)
    parent_id:    Optional[int] = Field(None, ge=1)
    gender:       Optional[str] = Field(None, pattern="^(male|female)$")
    birth_year:   Optional[int] = Field(None, ge=1300, le=2100)
    death_year:   Optional[int] = Field(None, ge=1300, le=2100)
    email:        Optional[str] = Field(None, max_length=120)
    phone:        Optional[str] = Field(None, max_length=30)
    is_alive:     bool          = True
    blood_type:        Optional[str]  = Field(None, max_length=8)
    profession:        Optional[str]  = Field(None, max_length=120)
    university_degree: Optional[str]  = Field(None, max_length=120)
    job_title:         Optional[str]  = Field(None, max_length=120)
    is_student:        bool           = False
    looking_for_job:   bool           = False


class FamilyMemberUpdate(BaseModel):
    """All fields optional — only provided fields get updated."""
    full_name:         Optional[str]  = Field(None, min_length=2, max_length=120)
    branch_name:       Optional[str]  = Field(None, max_length=80)
    parent_id:         Optional[int]  = None
    gender:            Optional[str]  = Field(None, pattern="^(male|female)$")
    birth_year:        Optional[int]  = Field(None, ge=1300, le=2100)
    death_year:        Optional[int]  = Field(None, ge=1300, le=2100)
    email:             Optional[str]  = Field(None, max_length=120)
    phone:             Optional[str]  = Field(None, max_length=30)
    is_alive:          Optional[bool] = None
    blood_type:        Optional[str]  = Field(None, max_length=8)
    profession:        Optional[str]  = Field(None, max_length=120)
    university_degree: Optional[str]  = Field(None, max_length=120)
    job_title:         Optional[str]  = Field(None, max_length=120)
    is_student:        Optional[bool] = None
    looking_for_job:   Optional[bool] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


class StatsResponse(BaseModel):
    total:       int
    living:      int
    deceased:    int
    generations: int
