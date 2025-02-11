from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User as DBUser
from models.user import UserCreate, UserLogin, User
from utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token
)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from fastapi import status

router = APIRouter()

@router.post("/signup", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # التحقق من أن كلمتي المرور متطابقتين
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )
    
    # التحقق من أن البريد الإلكتروني غير مستخدم
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # إنشاء المستخدم الجديد
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"} 