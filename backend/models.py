from sqlalchemy import Column, Integer, String, Boolean
from db import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id           = Column(Integer, primary_key=True, index=True)
    full_name    = Column(String, nullable=False, index=True)
    branch_name  = Column(String, nullable=True)
    parent_id    = Column(Integer, nullable=True)
    image_url    = Column(String, nullable=True)
    gender       = Column(String, nullable=True)   # 'male' | 'female'
    birth_year   = Column(Integer, nullable=True)
    death_year   = Column(Integer, nullable=True)
    email        = Column(String, nullable=True)
    phone        = Column(String, nullable=True)
    is_alive     = Column(Boolean, default=True, nullable=False)
    blood_type        = Column(String, nullable=True)
    profession        = Column(String, nullable=True)   # المهنة
    university_degree = Column(String, nullable=True)   # المؤهل الجامعي
    job_title         = Column(String, nullable=True)   # الوظيفة
    is_student        = Column(Boolean, default=False)
    looking_for_job   = Column(Boolean, default=False)
