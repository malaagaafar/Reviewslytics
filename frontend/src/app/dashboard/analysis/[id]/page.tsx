'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

interface AnalysisResults {
  status: string;
  results: {
    summary: string;
    sentiment_analysis: {
      average_sentiment: number;
      positive_reviews: number;
      negative_reviews: number;
      sentiment_distribution: {
        very_positive: number;
        positive: number;
        neutral: number;
        negative: number;
        very_negative: number;
      };
    };
    topics: {
      main_topics: Record<string, number>;
      topic_distribution: Record<string, number>;
    };
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  } | null;
}

const COLORS = ['#FF8000', '#FFB366', '#FFE5CC'];

// إضافة أنواع للتحليل
type AnalysisType = 'free' | 'premium';

interface AnalysisData {
  type: AnalysisType;
  reviews: {
    content: string;
    rating: number;
    date: string;
  }[];
}

// دوال التحليل المختلفة
const analyzers = {
  free: {
    async analyzeSentiment(reviews: string[]) {
      // تحليل بسيط للمشاعر
      return {
        positive: reviews.filter(r => r.includes('good') || r.includes('great')).length,
        negative: reviews.filter(r => r.includes('bad') || r.includes('poor')).length,
        neutral: reviews.filter(r => !r.includes('good') && !r.includes('bad')).length
      };
    },

    async extractTopics(reviews: string[]) {
      // استخراج بسيط للمواضيع
      const commonWords = reviews.join(' ')
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 3)
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      return Object.entries(commonWords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
    },

    generateRecommendations(sentiment: any, topics: any) {
      // توصيات بسيطة
      const recommendations = [];
      if (sentiment.negative > sentiment.positive) {
        recommendations.push("Focus on improving customer satisfaction");
      }
      if (topics.length > 0) {
        recommendations.push(`Pay attention to frequently mentioned topic: ${topics[0].topic}`);
      }
      return recommendations;
    }
  },

  premium: {
    async analyzeSentiment(reviews: string[]) {
      // تحليل متقدم للمشاعر باستخدام GPT
      const response = await fetch('http://localhost:8000/api/analysis/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reviews })
      });
      return response.json();
    },

    async extractTopics(reviews: string[]) {
      // تحليل متقدم للمواضيع باستخدام GPT
      const response = await fetch('http://localhost:8000/api/analysis/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reviews })
      });
      return response.json();
    },

    async generateRecommendations(sentiment: any, topics: any) {
      // توصيات متقدمة باستخدام GPT
      const response = await fetch('http://localhost:8000/api/analysis/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sentiment, topics })
      });
      return response.json();
    }
  }
};

// تحديث دالة التحليل الرئيسية
async function analyzeData(data: AnalysisData) {
  const analyzer = analyzers[data.type];
  const reviews = data.reviews.map(r => r.content);

  try {
    // تنفيذ التحليل
    const [sentiment, topics] = await Promise.all([
      analyzer.analyzeSentiment(reviews),
      analyzer.extractTopics(reviews)
    ]);

    // توليد التوصيات
    const recommendations = await analyzer.generateRecommendations(sentiment, topics);

    // إعداد النتائج
    return {
      sentiment,
      topics,
      recommendations,
      summary: data.type === 'premium' 
        ? await generatePremiumSummary(sentiment, topics)
        : generateBasicSummary(sentiment, topics)
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze data');
  }
}

// دوال مساعدة
function generateBasicSummary(sentiment: any, topics: any) {
  const totalReviews = sentiment.positive + sentiment.negative + sentiment.neutral;
  const positivePercentage = ((sentiment.positive / totalReviews) * 100).toFixed(1);
  
  return `Analysis of ${totalReviews} reviews shows ${positivePercentage}% positive sentiment. ` +
         `Main topics include ${topics[0]?.topic || 'various subjects'}.`;
}

async function generatePremiumSummary(sentiment: any, topics: any) {
  // توليد ملخص متقدم باستخدام GPT
  const response = await fetch('http://localhost:8000/api/analysis/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ sentiment, topics })
  });
  return response.json();
}

export default function AnalysisDashboard() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/analysis/status/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        setResults(data);

        // Continue checking if processing
        if (data.status === 'processing' || data.status === 'pending') {
          setTimeout(checkStatus, 5000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to fetch analysis status');
        setLoading(false);
      }
    };

    checkStatus();
  }, [params.id]);

  if (loading || results?.status === 'processing' || results?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-[#FF8000] rounded-full animate-bounce" />
              <div className="w-4 h-4 bg-[#FF8000] rounded-full animate-bounce [animation-delay:-.3s]" />
              <div className="w-4 h-4 bg-[#FF8000] rounded-full animate-bounce [animation-delay:-.5s]" />
            </div>
            <p className="text-center mt-4 text-gray-600">Analyzing your reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (results?.status === 'error' || !results?.results) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-center">
              <div className="text-red-500 mb-2">Analysis failed</div>
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-[#FF8000] hover:text-[#e67300] font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { sentiment_analysis, topics, summary, strengths, weaknesses, recommendations } = results.results;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#FF8000] transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Summary Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Analysis Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{summary}</p>
          </div>

          {/* Sentiment Analysis Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Sentiment Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF8000]">
                  {(sentiment_analysis.average_sentiment * 100).toFixed(0)}%
                </div>
                <div className="text-gray-600 mt-2">Positive Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500">
                  {sentiment_analysis.positive_reviews}
                </div>
                <div className="text-gray-600 mt-2">Positive Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500">
                  {sentiment_analysis.negative_reviews}
                </div>
                <div className="text-gray-600 mt-2">Negative Reviews</div>
              </div>
            </div>
          </div>

          {/* Topics Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Main Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(topics.main_topics).map(([topic, count]) => (
                <div key={topic} className="border rounded-xl p-4">
                  <div className="text-lg font-medium">{topic}</div>
                  <div className="text-gray-600">Mentioned {count} times</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendations && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Key Recommendations</h2>
              <ul className="space-y-4">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#FF8000] text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 