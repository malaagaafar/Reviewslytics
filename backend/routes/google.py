from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import GoogleAccount
from utils.auth import get_current_user
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# إعدادات Google OAuth2 - نستخدم فقط نطاق Business Profile
SCOPES = [
    'https://www.googleapis.com/auth/business.manage'
]

CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")]
    }
}

@router.get("/google")
async def google_auth(current_user = Depends(get_current_user)):
    """إنشاء رابط تفويض للوصول إلى Google Business Profile"""
    try:
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # دائماً اطلب الموافقة للحصول على refresh token
        )
        
        return {"url": authorization_url}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating Google authorization URL: {str(e)}"
        )

@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """معالجة استجابة Google وربط الحساب"""
    try:
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
        )
        
        # الحصول على التوكن
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # التحقق من وجود ربط سابق وتحديثه أو إنشاء ربط جديد
        google_account = db.query(GoogleAccount).filter(
            GoogleAccount.user_id == current_user.id
        ).first()

        if google_account:
            # تحديث التوكن الموجود
            google_account.access_token = credentials.token
            google_account.refresh_token = credentials.refresh_token
            google_account.token_expiry = credentials.expiry
        else:
            # إنشاء ربط جديد
            google_account = GoogleAccount(
                user_id=current_user.id,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expiry=credentials.expiry
            )
            db.add(google_account)

        db.commit()

        # اختبار الوصول بجلب قائمة الأعمال
        service = build('mybusinessaccountmanagement', 'v1', credentials=credentials)
        accounts = service.accounts().list().execute()
        
        return {
            "message": "Google Business Profile linked successfully",
            "accounts": accounts
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error linking Google Business Profile: {str(e)}"
        ) 