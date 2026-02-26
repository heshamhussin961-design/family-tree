from sqlalchemy import Column, Integer, String, Boolean
from db import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id          = Column(Integer, primary_key=True, index=True)
    full_name   = Column(String, nullable=False, index=True)
    branch_name = Column(String, nullable=True)
    parent_id   = Column(Integer, nullable=True)
    image_url   = Column(String, nullable=True)
    gender      = Column(String, nullable=True)   # 'male' | 'female'
    birth_year  = Column(Integer, nullable=True)
    death_year  = Column(Integer, nullable=True)
    email       = Column(String, nullable=True)
    phone       = Column(String, nullable=True)
    is_alive    = Column(Boolean, default=True, nullable=False)
