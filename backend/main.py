from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, google  # تأكد من استيراد مسار Google
from dotenv import load_dotenv

load_dotenv()  # أضف هذا في بداية الملف

app = FastAPI()

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://172.29.32.1:3000"],  # عنوان الفرونت إند
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