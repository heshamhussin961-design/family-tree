from typing import Optional, List
from pydantic import BaseModel, Field


class FamilyMemberBase(BaseModel):
    id:          int
    full_name:   str
    branch_name: Optional[str] = None
    parent_id:   Optional[int] = None
    image_url:   Optional[str] = None
    gender:      Optional[str] = None
    birth_year:  Optional[int] = None
    death_year:  Optional[int] = None
    email:       Optional[str] = None
    phone:       Optional[str] = None
    is_alive:    bool = True

    model_config = {"from_attributes": True}


class FamilyMemberDetail(FamilyMemberBase):
    pass


class SearchResult(FamilyMemberBase):
    pass


class LineageResponse(BaseModel):
    person:  FamilyMemberDetail
    lineage: List[SearchResult]


class FamilyMemberCreate(BaseModel):
    full_name:   str           = Field(..., min_length=2, max_length=120)
    branch_name: Optional[str] = Field(None, max_length=80)
    parent_id:   Optional[int] = Field(None, ge=1)
    gender:      Optional[str] = Field(None, pattern="^(male|female)$")
    birth_year:  Optional[int] = Field(None, ge=1300, le=2100)
    death_year:  Optional[int] = Field(None, ge=1300, le=2100)
    email:       Optional[str] = Field(None, max_length=120)
    phone:       Optional[str] = Field(None, max_length=30)
    is_alive:    bool          = True


class FamilyMemberUpdate(BaseModel):
    """All fields optional — only provided fields get updated."""
    full_name:   Optional[str] = Field(None, min_length=2, max_length=120)
    branch_name: Optional[str] = Field(None, max_length=80)
    parent_id:   Optional[int] = None
    gender:      Optional[str] = Field(None, pattern="^(male|female)$")
    birth_year:  Optional[int] = Field(None, ge=1300, le=2100)
    death_year:  Optional[int] = Field(None, ge=1300, le=2100)
    email:       Optional[str] = Field(None, max_length=120)
    phone:       Optional[str] = Field(None, max_length=30)
    is_alive:    Optional[bool] = None


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
