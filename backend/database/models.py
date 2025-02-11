from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    google_account = relationship("GoogleAccount", back_populates="user", uselist=False)

class GoogleAccount(Base):
    __tablename__ = "google_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    access_token = Column(String)
    refresh_token = Column(String)
    token_expiry = Column(DateTime)
    business_locations = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="google_account") 