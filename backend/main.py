from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, google  # تأكد من استيراد مسار Google

app = FastAPI()

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # عنوان الفرونت إند
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# إضافة مسارات المصادقة
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(google.router, prefix="/api/auth", tags=["google"])

@app.get("/")
async def root():
    return {"message": "API is running"}