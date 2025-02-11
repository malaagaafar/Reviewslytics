from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import GoogleAccount
from utils.auth import get_current_user
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

router = APIRouter()

# إعدادات Google OAuth2
SCOPES = [
    'https://www.googleapis.com/auth/business.manage'
]

CLIENT_CONFIG = {
    "web": {
        "client_id": "YOUR_CLIENT_ID",  # استبدل بـ Client ID الخاص بك
        "client_secret": "YOUR_CLIENT_SECRET",  # استبدل بـ Client Secret الخاص بك
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost:3000/google/callback"]
    }
}

@router.get("/auth/google")
async def google_auth():
    print("Google auth endpoint hit")  # نقطة تفتيش
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return {"url": authorization_url}

@router.get("/auth/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=SCOPES,
        state=state,
        redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
    )
    
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # حفظ التوكن في قاعدة البيانات
    google_account = GoogleAccount(
        user_id=current_user.id,
        access_token=credentials.token,
        refresh_token=credentials.refresh_token,
        token_expiry=credentials.expiry
    )
    
    db.add(google_account)
    db.commit()
    db.refresh(google_account)

    # جلب معلومات الأعمال
    service = build('mybusinessaccountmanagement', 'v1', credentials=credentials)
    accounts = service.accounts().list().execute()
    
    return {"message": "Google account linked successfully", "accounts": accounts} 