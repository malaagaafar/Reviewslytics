from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from pydantic import BaseModel
import os
import json
import csv
from datetime import datetime, UTC
import uuid
from io import StringIO

from app.database.models import Review, User
from app.database.database import get_db
from app.utils.auth import get_current_user

# إعداد التسجيل
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()

UPLOAD_DIRECTORY = "uploads"
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

class FileResponse(BaseModel):
    id: str
    fileName: str
    uploadDate: datetime
    reviewCount: int
    fileType: str

@router.get("/files", response_model=List[FileResponse])
async def get_user_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # استخدام datetime.strptime لتحويل النص إلى كائن datetime
    files = db.query(
        func.strftime('%Y-%m-%d %H:%M:00', Review.created_at).label('upload_date_str'),
        func.count(Review.id).label('review_count'),
        Review.source,
        func.min(Review.id).label('batch_id')
    ).filter(
        Review.user_id == current_user.id
    ).group_by(
        func.strftime('%Y-%m-%d %H:%M:00', Review.created_at),
        Review.source
    ).order_by(
        text('upload_date_str DESC')
    ).all()
    
    result = [
        FileResponse(
            id=str(file.batch_id),
            fileName=f"Reviews from {file.source.capitalize()} - {file.upload_date_str}",
            uploadDate=datetime.strptime(file.upload_date_str, '%Y-%m-%d %H:%M:00'),
            reviewCount=file.review_count,
            fileType=file.source
        ) for file in files
    ]
    
    return result

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = "json",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        upload_id = str(uuid.uuid4())
        upload_time = datetime.now(UTC)
        
        content = await file.read()
        content_str = content.decode('utf-8')
        
        reviews_data = []
        if file_type == "json":
            data = json.loads(content_str)
            reviews_data = data if isinstance(data, list) else [data]
        else:  # csv
            csv_file = StringIO(content_str)
            csv_reader = csv.DictReader(csv_file)
            reviews_data = list(csv_reader)

        added_reviews = []
        for review_data in reviews_data:
            review_dict = {
                'user_id': current_user.id,
                'upload_id': upload_id,
                'business_name': review_data.get('business_name', ''),
                'reviewer_name': review_data.get('reviewer_name', ''),
                'rating': float(review_data.get('rating', 0)),
                'comment': review_data.get('comment', ''),
                'review_date': datetime.strptime(review_data.get('review_date', ''), '%Y-%m-%d') if review_data.get('review_date') else datetime.now(UTC),
                'source': f'manual_{file_type}',
                'created_at': upload_time
            }
            
            review = Review(**review_dict)
            db.add(review)
            added_reviews.append(review)

        db.commit()

        saved = db.query(Review).filter(Review.upload_id == upload_id).all()
        if not saved:
            raise HTTPException(status_code=500, detail="Failed to save reviews")

        return FileResponse(
            id=upload_id,
            fileName=file.filename,
            uploadDate=upload_time,
            reviewCount=len(added_reviews),
            fileType=file_type
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/files/{batch_id}")
async def delete_file_reviews(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """حذف مجموعة من المراجعات بناءً على وقت الإنشاء"""
    try:
        # الحصول على وقت الإنشاء للمراجعة المحددة
        target_review = db.query(Review).filter(
            Review.id == int(batch_id),
            Review.user_id == current_user.id
        ).first()

        if not target_review:
            raise HTTPException(status_code=404, detail="File not found")

        # حذف جميع المراجعات التي تم إنشاؤها في نفس الدقيقة
        target_minute = func.strftime('%Y-%m-%d %H:%M:00', target_review.created_at)
        deleted = db.query(Review).filter(
            Review.user_id == current_user.id,
            func.strftime('%Y-%m-%d %H:%M:00', Review.created_at) == target_minute,
            Review.source == target_review.source
        ).delete(synchronize_session=False)

        if not deleted:
            raise HTTPException(status_code=404, detail="No reviews found to delete")

        db.commit()
        return {"message": f"Deleted {deleted} reviews successfully"}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid batch ID")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))