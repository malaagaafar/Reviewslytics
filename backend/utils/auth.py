from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db  # تأكد من استيراد get_db
from models import user  # تأكد من استيراد نموذج المستخدم
import os
from dotenv import load_dotenv

load_dotenv()

# إعدادات التشفير
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# المتغيرات السرية (يجب وضعها في ملف .env)
SECRET_KEY = os.getenv("9ca99e1b27b4249608c34e2730c9cafcf768ad6d12f91d8dfc86efc4511db18e3630e14131abce49bf26d4cec8548387d6d778a44f2a080809e282f50165a432a21c64e928c154891ea4fb2d49dc92da1f980387824b7d1efc77fd6d66e1136edaaf869d6c4c544e057e58e8b04cc3a8897267b15318e274a88d06743ccca52ea223c96be6bddfbb42b802ff7be61ad34f0e1b486d056022532b887f733f9716be372ae0f94d30b845ada3d12050f2b49649f2ddb89fd38abe0ff107eb45ed59165a6c11f4f7033a58cf2446882ebb2dd1f64055c7dcff6e5329a7b54235607a933a3389f454ae1a5bc81ad886fd31105452a4b6b2546cb3d9b1e7ca41883759")  # تأكد من أن لديك SECRET_KEY في ملف .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(user).filter(user.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user 