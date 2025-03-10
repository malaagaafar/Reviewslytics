from transformers import pipeline
import nltk
from functools import lru_cache

# Download NLTK data once at startup
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

@lru_cache(maxsize=1)
def get_sentiment_analyzer():
    """Initialize sentiment analyzer (cached)"""
    return pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        max_length=512,
        truncation=True
    )

@lru_cache(maxsize=1)
def get_topic_analyzer():
    """Initialize topic analyzer (cached)"""
    return pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        max_length=512,
        truncation=True
    ) 