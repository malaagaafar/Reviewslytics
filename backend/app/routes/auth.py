from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User as DBUser
from app.schemas.user import UserCreate, UserLogin, User
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token
)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from fastapi import status

router = APIRouter()

# تعريف مدة صلاحية التوكن
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    
    # تحويل DBUser إلى نموذج User
    return User(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name
    )

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(DBUser).filter(DBUser.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=60 * 24)  # 24 hours
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    } 