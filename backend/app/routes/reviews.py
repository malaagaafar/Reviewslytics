from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Review
from app.utils.auth import get_current_user
import json
import csv
from io import StringIO
from datetime import datetime

router = APIRouter()

def parse_date(date_str: str) -> datetime:
    """Convert date string to datetime object"""
    try:
        formats = [
            "%Y-%m-%d",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y",
            "%m/%d/%Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
                
        return datetime.utcnow()
    except:
        return datetime.utcnow()

def parse_google_timestamp(timestamp: int) -> datetime:
    """Convert Google timestamp (milliseconds) to datetime"""
    try:
        return datetime.fromtimestamp(timestamp / 1000)  # Convert from milliseconds to seconds
    except:
        return datetime.utcnow()

@router.post("/upload")
async def upload_reviews(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        reviews_data = []
        
        if file_type == "json":
            content_str = content.decode('utf-8')
            json_data = json.loads(content_str)
            
            # Handle both single review and array of reviews
            if not isinstance(json_data, list):
                json_data = [json_data]
            
            for item in json_data:
                try:
                    # Extract response text and time if available
                    response = item.get("resp", {})
                    response_text = response.get("text", "") if response else ""
                    
                    # Handle image URLs
                    pics = item.get("pics", [])
                    image_urls = []
                    for pic in pics:
                        if isinstance(pic, dict) and "url" in pic:
                            image_urls.extend(pic["url"])
                    
                    review = {
                        "business_name": "Google Business",  # You might want to store this separately
                        "reviewer_name": str(item.get("name", "Anonymous")),
                        "rating": float(item.get("rating", 0)),
                        "comment": str(item.get("text", "")),
                        "review_date": parse_google_timestamp(item.get("time", 0)),
                        "source": "google",
                        "google_review_id": str(item.get("gmap_id", "")),
                        "response_text": response_text,
                        "response_time": parse_google_timestamp(response.get("time", 0)) if response else None,
                        "image_urls": ",".join(image_urls) if image_urls else None
                    }
                    reviews_data.append(review)
                except Exception as e:
                    print(f"Error processing review: {e}")
                    continue
                
        elif file_type == "csv":
            # Handle CSV file
            content_str = content.decode('utf-8')
            csv_file = StringIO(content_str)
            csv_reader = csv.DictReader(csv_file)
            
            for row in csv_reader:
                try:
                    review = {
                        "business_name": str(row.get("business_name", "Unknown")),
                        "reviewer_name": str(row.get("reviewer_name", "Anonymous")),
                        "rating": float(row.get("rating", 0)),
                        "comment": str(row.get("comment", "")),
                        "review_date": parse_date(str(row.get("date", ""))),
                        "source": "manual_csv"
                    }
                    reviews_data.append(review)
                except Exception as e:
                    print(f"Error processing row: {e}")
                    continue
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )

        if not reviews_data:
            raise HTTPException(
                status_code=400,
                detail="No valid reviews found in file"
            )

        # Save reviews to database
        for review_data in reviews_data:
            db_review = Review(
                user_id=current_user.id,
                **review_data
            )
            db.add(db_review)
        
        db.commit()

        return {
            "message": "Reviews uploaded successfully",
            "count": len(reviews_data)
        }

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON file format: {str(e)}"
        )
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/my-reviews")
async def get_my_reviews(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's reviews"""
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    return reviews 