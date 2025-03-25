from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, google, reviews, analysis, files
from dotenv import load_dotenv
import logging
from datetime import datetime

load_dotenv()

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# إضافة middleware للتسجيل
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request path: {request.url.path}")
    logger.info(f"Request method: {request.method}")
    
    # تنفيذ الطلب
    response = await call_next(request)
    
    logger.info(f"Response status: {response.status_code}")
    return response

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# إضافة مسارات API
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(google.router, prefix="/api/auth", tags=["google"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(files.router, prefix="/api/reviews", tags=["files"])
app.include_router(google.router, prefix="/api/google", tags=["google"])  # تغيير المسار هنا


@app.get("/")
async def root():
    return {"message": "API is running"}