from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    google_account = relationship("GoogleAccount", back_populates="user", uselist=False)
    
    # Define relationships
    reviews = relationship("Review", back_populates="user")
    analyses = relationship("Analysis", back_populates="user")

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

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    upload_id = Column(String(50))
    business_name = Column(String)
    reviewer_name = Column(String)
    rating = Column(Float)
    comment = Column(Text)
    review_date = Column(DateTime)
    source = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # New fields for Google reviews
    google_review_id = Column(String, nullable=True)
    response_text = Column(Text, nullable=True)
    response_time = Column(DateTime, nullable=True)
    image_urls = Column(Text, nullable=True)  # Comma-separated URLs
    
    # Relationship with user
    user = relationship("User", back_populates="reviews")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    analysis_type = Column(String)  # 'free' or 'premium'
    status = Column(String)  # 'pending', 'processing', 'completed', 'error'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # نتائج التحليل
    summary = Column(Text, nullable=True)
    sentiment_analysis = Column(JSON, nullable=True)
    topics = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="analyses") 