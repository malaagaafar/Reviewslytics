from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import GoogleAccount
from app.utils.auth import get_current_user
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

# تحديث النطاقات لتشمل كل ما يعيده Google
SCOPES = [
    'https://www.googleapis.com/auth/business.manage',
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
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
        logger.debug("Starting Google auth process")
        logger.debug(f"Client ID: {os.getenv('GOOGLE_CLIENT_ID')}")
        logger.debug(f"Redirect URI: {os.getenv('GOOGLE_REDIRECT_URI')}")

        if not os.getenv("GOOGLE_CLIENT_ID") or not os.getenv("GOOGLE_CLIENT_SECRET"):
            raise HTTPException(
                status_code=500,
                detail="Google OAuth credentials not properly configured"
            )

        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        logger.debug(f"Generated auth URL: {authorization_url}")
        return {"url": authorization_url}
    except Exception as e:
        logger.error(f"Error in google_auth: {str(e)}", exc_info=True)
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
        logger.debug("Starting callback processing")
        logger.debug(f"Received code: {code[:10]}...")
        logger.debug(f"Received state: {state}")

        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG['web']['redirect_uris'][0]
        )
        
        # تعطيل التحقق من النطاقات
        flow.oauth2session._compliance_fixes = {
            'scope_to_scopes': lambda x: x
        }
        
        logger.debug("Fetching token")
        flow.fetch_token(code=code)
        credentials = flow.credentials
        logger.debug("Token fetched successfully")

        # حفظ بيانات الاعتماد
        google_account = db.query(GoogleAccount).filter(
            GoogleAccount.user_id == current_user.id
        ).first()

        if google_account:
            logger.debug("Updating existing Google account")
            google_account.access_token = credentials.token
            google_account.refresh_token = credentials.refresh_token
            google_account.token_expiry = credentials.expiry
        else:
            logger.debug("Creating new Google account")
            google_account = GoogleAccount(
                user_id=current_user.id,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_expiry=credentials.expiry
            )
            db.add(google_account)

        db.commit()
        logger.debug("Database updated successfully")

        return {
            "message": "Google Business Profile linked successfully",
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error in google_callback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error linking Google Business Profile: {str(e)}"
        )

@router.get("/reviews")
async def get_google_reviews(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """جلب المراجعات من Google Business Profile"""
    try:
        logger.debug("Fetching Google reviews")
        
        # الحصول على بيانات اعتماد Google
        google_account = db.query(GoogleAccount).filter(
            GoogleAccount.user_id == current_user.id
        ).first()

        if not google_account:
            raise HTTPException(
                status_code=404,
                detail="Google account not linked"
            )

        # إنشاء كائن Credentials
        credentials = Credentials(
            token=google_account.access_token,
            refresh_token=google_account.refresh_token,
            token_uri=CLIENT_CONFIG['web']['token_uri'],
            client_id=CLIENT_CONFIG['web']['client_id'],
            client_secret=CLIENT_CONFIG['web']['client_secret'],
            scopes=SCOPES
        )

        # إنشاء خدمة Business Profile API
        mybusiness = build('mybusinessbusinessinformation', 'v1', credentials=credentials)
        
        # الحصول على قائمة الأماكن
        accounts_service = build('mybusinessaccountmanagement', 'v1', credentials=credentials)
        accounts = accounts_service.accounts().list().execute()
        
        all_reviews = []
        
        # لكل حساب، احصل على الأماكن والمراجعات
        for account in accounts.get('accounts', []):
            account_name = account['name']
            logger.debug(f"Processing account: {account_name}")
            
            try:
                # الحصول على قائمة الأماكن
                locations = mybusiness.accounts().locations().list(
                    parent=account_name
                ).execute()
                
                # لكل مكان، احصل على المراجعات
                for location in locations.get('locations', []):
                    location_name = location['name']
                    logger.debug(f"Fetching reviews for location: {location_name}")
                    
                    try:
                        # إنشاء خدمة المراجعات
                        reviews_service = build('mybusinessreviews', 'v1', credentials=credentials)
                        
                        # جلب المراجعات
                        reviews = reviews_service.accounts().locations().reviews().list(
                            parent=location_name
                        ).execute()
                        
                        # إضافة معلومات المكان للمراجعات
                        for review in reviews.get('reviews', []):
                            review['locationName'] = location.get('title', '')
                            review['locationId'] = location_name
                        
                        all_reviews.extend(reviews.get('reviews', []))
                        
                    except Exception as loc_error:
                        logger.error(f"Error fetching reviews for location {location_name}: {str(loc_error)}")
                        continue
                    
            except Exception as acc_error:
                logger.error(f"Error processing account {account_name}: {str(acc_error)}")
                continue

        return {
            "reviews": all_reviews,
            "total_count": len(all_reviews)
        }

    except Exception as e:
        logger.error(f"Error fetching Google reviews: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching reviews: {str(e)}"
        ) 