from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis, Review, User
from app.utils.auth import get_current_user
from app.utils.analyzers import get_sentiment_analyzer, get_topic_analyzer
from typing import List, Literal
import openai
from datetime import datetime
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from transformers import pipeline
from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from collections import Counter
import nltk
import numpy as np
import json

load_dotenv()
router = APIRouter()

openai.api_key = os.getenv("OPENAI_API_KEY")

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Initialize sentiment analyzer
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    max_length=512,
    truncation=True
)

# Initialize topic classifier
topic_analyzer = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    max_length=512,
    truncation=True
)

class AnalysisRequest(BaseModel):
    analysis_type: Literal['free', 'premium']

async def analyze_reviews(
    analysis_id: int,
    reviews: List[Review],
    db: Session
):
    """Background task to analyze reviews using OpenAI"""
    try:
        # Update status to processing
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        analysis.status = "processing"
        db.commit()

        # Prepare reviews text
        reviews_text = "\n".join([
            f"Rating: {r.rating}\nReview: {r.comment}"
            for r in reviews
        ])

        # Get general summary
        summary_response = await openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a business analyst expert. Analyze these reviews and provide a comprehensive summary."},
                {"role": "user", "content": f"Analyze these reviews:\n{reviews_text}"}
            ]
        )
        
        # Get sentiment analysis
        sentiment_response = await openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Analyze the sentiment of these reviews and provide statistics."},
                {"role": "user", "content": f"Analyze sentiment:\n{reviews_text}"}
            ]
        )
        
        # Get topics
        topics_response = await openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Identify main topics and themes from these reviews."},
                {"role": "user", "content": f"Identify topics:\n{reviews_text}"}
            ]
        )

        # Update analysis with results
        analysis.summary = summary_response.choices[0].message.content
        analysis.sentiment_analysis = {
            "analysis": sentiment_response.choices[0].message.content
        }
        analysis.topics = {
            "topics": topics_response.choices[0].message.content
        }
        analysis.status = "completed"
        db.commit()

    except Exception as e:
        analysis.status = "error"
        analysis.summary = str(e)
        db.commit()

async def analyze_reviews_free(
    analysis_id: int,
    reviews: List[Review],
    db: Session
):
    """Free analysis using open-source models"""
    try:
        # Get cached analyzers
        sentiment_analyzer = get_sentiment_analyzer()
        topic_analyzer = get_topic_analyzer()

        # Update status to processing
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        analysis.status = "processing"
        db.commit()

        # Prepare reviews
        review_texts = [r.comment for r in reviews if r.comment]
        ratings = [r.rating for r in reviews if r.rating]

        # 1. Sentiment Analysis
        sentiments = []
        for text in review_texts:
            try:
                # Split long reviews into sentences
                sentences = sent_tokenize(text)
                # Analyze each sentence
                sentence_sentiments = sentiment_analyzer(sentences)
                # Take average sentiment
                avg_sentiment = np.mean([
                    1 if s['label'] == 'POSITIVE' else 0 
                    for s in sentence_sentiments
                ])
                sentiments.append(avg_sentiment)
            except Exception as e:
                print(f"Error in sentiment analysis: {e}")
                continue

        # 2. Topic Analysis
        # Common business-related topics
        candidate_topics = [
            "service quality",
            "staff behavior",
            "pricing",
            "product quality",
            "cleanliness",
            "location",
            "atmosphere",
            "wait time"
        ]

        # Analyze topics for each review
        topic_results = []
        for text in review_texts:
            try:
                result = topic_analyzer(
                    text,
                    candidate_topics,
                    multi_label=True
                )
                topic_results.append(result)
            except Exception as e:
                print(f"Error in topic analysis: {e}")
                continue

        # 3. Generate Summary
        avg_rating = np.mean(ratings) if ratings else 0
        avg_sentiment = np.mean(sentiments) if sentiments else 0
        
        # Count most common topics
        all_topics = []
        for result in topic_results:
            # Get topics with confidence > 0.5
            topics = [
                label for label, score in zip(result['labels'], result['scores'])
                if score > 0.5
            ]
            all_topics.extend(topics)
        
        topic_counts = Counter(all_topics)
        main_topics = dict(topic_counts.most_common(3))

        # Prepare results
        summary = f"""
Analysis Summary:
- Average Rating: {avg_rating:.1f}/5
- Overall Sentiment: {avg_sentiment:.0%} Positive
- Main Topics Discussed: {', '.join(main_topics.keys())}
- Total Reviews Analyzed: {len(reviews)}
        """.strip()

        # Prepare detailed analysis
        sentiment_analysis = {
            "average_sentiment": float(avg_sentiment),
            "positive_reviews": sum(1 for s in sentiments if s > 0.5),
            "negative_reviews": sum(1 for s in sentiments if s <= 0.5),
            "sentiment_distribution": {
                "very_positive": sum(1 for s in sentiments if s > 0.8),
                "positive": sum(1 for s in sentiments if 0.6 < s <= 0.8),
                "neutral": sum(1 for s in sentiments if 0.4 <= s <= 0.6),
                "negative": sum(1 for s in sentiments if 0.2 <= s < 0.4),
                "very_negative": sum(1 for s in sentiments if s < 0.2)
            }
        }

        topics_analysis = {
            "main_topics": main_topics,
            "topic_distribution": {
                topic: count/len(topic_results) 
                for topic, count in topic_counts.items()
            }
        }

        # Update analysis with results
        analysis.summary = summary
        analysis.sentiment_analysis = sentiment_analysis
        analysis.topics = topics_analysis
        analysis.status = "completed"
        db.commit()

    except Exception as e:
        print(f"Analysis error: {e}")
        analysis.status = "error"
        analysis.summary = str(e)
        db.commit()

# Update the original analyze_reviews function to be analyze_reviews_premium
async def analyze_reviews_premium(
    analysis_id: int,
    reviews: List[Review],
    db: Session
):
    """Premium analysis using OpenAI"""
    # ... existing OpenAI analysis code ...

@router.post("/analyze")
async def start_analysis(
    request: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new analysis"""
    try:
        print(f"Current user: {current_user.id}")
        
        # Get user's reviews
        reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
        print(f"Found {len(reviews)} reviews")
        
        if not reviews:
            raise HTTPException(
                status_code=400,
                detail="No reviews found to analyze"
            )

        # Create new analysis
        analysis = Analysis(
            user_id=current_user.id,
            analysis_type=request.analysis_type,
            status="pending"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Start analysis based on type
        if request.analysis_type == 'premium':
            await analyze_reviews_premium(analysis.id, reviews, db)
        else:
            await analyze_reviews_free(analysis.id, reviews, db)

        return {
            "message": f"Analysis started ({request.analysis_type})",
            "analysis_id": analysis.id
        }

    except Exception as e:
        print(f"Error in start_analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/status/{analysis_id}")
async def get_analysis_status(
    analysis_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis status and results"""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )
    
    return {
        "status": analysis.status,
        "results": {
            "summary": analysis.summary,
            "sentiment_analysis": analysis.sentiment_analysis,
            "topics": analysis.topics,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "recommendations": analysis.recommendations
        } if analysis.status == "completed" else None
    } 