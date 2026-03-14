from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from db import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id           = Column(Integer, primary_key=True, index=True)
    full_name    = Column(String, nullable=False, index=True)
    branch_name  = Column(String, nullable=True)
    parent_id    = Column(Integer, ForeignKey("family_members.id"), nullable=True, index=True)
    image_url    = Column(String, nullable=True)
    gender       = Column(String, nullable=True)   # 'male' | 'female'
    birth_year   = Column(Integer, nullable=True)
    birth_month  = Column(Integer, nullable=True)
    birth_day    = Column(Integer, nullable=True)
    death_year   = Column(Integer, nullable=True)
    death_month  = Column(Integer, nullable=True)
    death_day    = Column(Integer, nullable=True)
    email        = Column(String, nullable=True)
    phone        = Column(String, nullable=True)
    is_alive     = Column(Boolean, default=True, nullable=False)
    blood_type        = Column(String, nullable=True)
    profession        = Column(String, nullable=True)   # المهنة
    university_degree = Column(String, nullable=True)   # المؤهل الجامعي
    job_title         = Column(String, nullable=True)   # الوظيفة
    is_student        = Column(Boolean, default=False)
    looking_for_job   = Column(Boolean, default=False)
    is_approved       = Column(Boolean, default=True)
    birth_place       = Column(String, nullable=True)     # مكان الميلاد
    residence_place   = Column(String, nullable=True)     # مكان الإقامة
    is_married        = Column(Boolean, default=False)    # متزوج؟
    marital_status    = Column(String, nullable=True)     # الحالة الاجتماعية (مطلق، أرمل، إلخ)
    is_public         = Column(Boolean, default=True, nullable=False) # ظهور للزوار؟


class AppSetting(Base):
    __tablename__ = "app_settings"
    key   = Column(String, primary_key=True)
    value = Column(String)


class Spouse(Base):
    __tablename__ = "spouses"

    id           = Column(Integer, primary_key=True, index=True)
    member_id    = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    full_name    = Column(String, nullable=False)
    birth_year   = Column(Integer, nullable=True)
    birth_month  = Column(Integer, nullable=True)
    birth_day    = Column(Integer, nullable=True)
    birth_place  = Column(String, nullable=True)
    phone        = Column(String, nullable=True)
    email        = Column(String, nullable=True)
    profession   = Column(String, nullable=True)
    notes        = Column(String, nullable=True)
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, nullable=False, index=True)
    password_hash   = Column(String, nullable=False)
    display_name    = Column(String, nullable=False)
    role            = Column(String, nullable=False, default="branch_editor")  # 'admin' | 'branch_editor'
    branch_root_id  = Column(Integer, ForeignKey("family_members.id"), nullable=True)  # root of editable branch
    member_id       = Column(Integer, ForeignKey("family_members.id"), nullable=True)  # linked family member
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Invitation(Base):
    __tablename__ = "invitations"

    id              = Column(Integer, primary_key=True, index=True)
    code            = Column(String, unique=True, nullable=False, index=True)
    branch_root_id  = Column(Integer, ForeignKey("family_members.id"), nullable=False)
    created_by      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    used_by         = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    expires_at      = Column(DateTime, nullable=True)
    max_uses        = Column(Integer, default=1)
    use_count       = Column(Integer, default=0)
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ArchiveItem(Base):
    __tablename__ = "archive_items"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, nullable=True)
    file_url    = Column(String, nullable=False)
    file_type   = Column(String, nullable=False)       # 'image' | 'document'
    category    = Column(String, nullable=False)        # 'photos' | 'documents' | 'letters' | 'stories'
    is_visible  = Column(Boolean, default=False)        # admin controls public visibility
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # None for system/built-in admin
    username     = Column(String, nullable=True)
    action       = Column(String, nullable=False) # 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
    target_table = Column(String, nullable=False) # 'family_members', 'users', etc.
    target_id    = Column(Integer, nullable=False)
    old_values   = Column(JSON, nullable=True)
    new_values   = Column(JSON, nullable=True)
    timestamp    = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Story(Base):
    __tablename__ = "stories"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    content      = Column(String, nullable=False)
    order        = Column(Integer, default=0)
    is_visible   = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Ambassador(Base):
    __tablename__ = "ambassadors"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    country     = Column(String, nullable=False)
    years       = Column(Integer, nullable=True) # Years of being an ambassador
    image_url   = Column(String, nullable=True)
    is_visible  = Column(Boolean, default=True)
    order       = Column(Integer, default=0)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Competition(Base):
    __tablename__ = "competitions"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active   = Column(Boolean, default=True)
    order       = Column(Integer, default=0)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CompetitionResult(Base):
    __tablename__ = "competition_results"

    id             = Column(Integer, primary_key=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False)
    member_name    = Column(String, nullable=False) # Name of candidate/winner
    member_id      = Column(Integer, ForeignKey("family_members.id", ondelete="SET NULL"), nullable=True) # Optional link to registry
    status         = Column(String, default="candidate") # 'candidate' | 'winner'
    reward         = Column(String, nullable=True) # e.g. 'شهادة تقدير', 'جائزة مالية'
    year           = Column(Integer, nullable=True)
    notes          = Column(String, nullable=True)
    created_at     = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Heritage(Base):
    __tablename__ = "heritage"

    id           = Column(Integer, primary_key=True, index=True)
    section_key  = Column(String, unique=True, nullable=False, index=True) # e.g. 'definition', 'benefits', 'roots'
    type         = Column(String, nullable=False) # 'text', 'points', 'grid', 'list'
    title        = Column(String, nullable=False)
    subtitle     = Column(String, nullable=True)
    content      = Column(JSON, nullable=False) # Stores the flexible data structure
    icon         = Column(String, nullable=True) # e.g. 'History', 'Users'
    order        = Column(Integer, default=0)
    is_visible   = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=lambda: datetime.now(timezone.utc))
