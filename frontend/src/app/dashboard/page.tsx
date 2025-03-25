'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { toast } from 'react-hot-toast';

interface UploadedFile {
  id: number;
  fileName: string;
  uploadDate: string;
  reviewCount: number;
  isSelected?: boolean;
  reviews?: { id: string; content: string; isSelected: boolean }[];
}

type AnalysisType = 'free' | 'premium' | null;

interface AnalysisRequest {
  analysis_type: 'free' | 'premium';
  file_ids: number[];
  selected_reviews: {
    file_id: number;
    review_ids: string[];  // أو number[] حسب نظام التخزين
  }[];
}

interface Review {
  id: string;  // أو number
  content: string;
  isSelected: boolean;
}

interface FileType {
  id: number;
  fileName: string;
  uploadDate: string;
  reviewCount: number;
  reviews?: Review[];
}

interface BusinessLocation {
  name: string;
  title: string;
  reviews?: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [uploadType, setUploadType] = useState<'json' | 'csv'>('json');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [savedFiles, setSavedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>('free');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessLocation[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userStr));
    } catch (e) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedFiles();
    }
  }, [user]);

  useEffect(() => {
    // التحقق من حالة الربط عند تحميل الصفحة
    const connected = searchParams.get('connected');
    const savedReviews = localStorage.getItem('googleReviews');
    
    if (connected === 'true' && savedReviews) {
      setBusinesses(JSON.parse(savedReviews));
      // مسح المراجعات المخزنة بعد استخدامها
      localStorage.removeItem('googleReviews');
    }
  }, [searchParams]);

  const fetchSavedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/reviews/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedFiles(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching saved files:', error);
    }
  };

  const handleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return newSelection;
    });
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/reviews/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSavedFiles(prev => prev.filter(file => file.id !== fileId));
        setSelectedFiles(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(fileId);
          return newSelection;
        });
        toast.success('File deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleGoogleLink = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/auth/google', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // توجيه المستخدم إلى صفحة تفويض Google
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get Google authorization URL');
      }
    } catch (error) {
      console.error('Error linking Google account:', error);
      alert('Error linking Google account');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', uploadType);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:8000/api/reviews/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // تحديث قائمة الملفات بعد الرفع الناجح
        fetchSavedFiles();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof Error && error.message === 'Not authenticated') {
        router.push('/login');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFiles.size) {
      toast.error('Please select files to analyze');
      return;
    }

    if (!selectedAnalysisType) {
      toast.error('Please select an analysis type');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          analysis_type: selectedAnalysisType,
          file_ids: Array.from(selectedFiles)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const data = await response.json();
      router.push(`/dashboard/analysis/${data.analysis_id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnalysisStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/analysis/status/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisStatus(data.status);
        
        if (data.status === 'completed') {
          setAnalysisResults(data.results);
        } else if (data.status === 'processing') {
          // Check again in 5 seconds
          setTimeout(() => checkAnalysisStatus(id), 5000);
        }
      }
    } catch (error) {
      console.error('Error checking analysis status:', error);
    }
  };

  const handleDeleteClick = (file: UploadedFile) => {
    setSelectedFile(file);
    setShowDeleteConfirm(true);
  };

  const FileReviews = ({ file }: { file: FileType }) => {
    return (
      <div className="ml-8 mt-2">
        {file.reviews?.map((review) => (
          <div key={review.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={review.isSelected}
              onChange={() => {
                // تحديث حالة المراجعة
                const updatedFiles = savedFiles.map(f => {
                  if (f.id === file.id) {
                    return {
                      ...f,
                      reviews: f.reviews?.map(r => 
                        r.id === review.id ? { ...r, isSelected: !r.isSelected } : r
                      )
                    };
                  }
                  return f;
                });
                setSavedFiles(updatedFiles);
              }}
              className="h-4 w-4 text-[#FF8000] focus:ring-[#FF8000] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600">{review.content}</span>
          </div>
        ))}
      </div>
    );
  };

  const fetchGoogleReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/google/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Google reviews:', data);
        // معالجة المراجعات هنا
        return data.reviews;
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      toast.error('Error fetching Google reviews');
    }
  };

  const fetchBusinessLocations = async () => {
    try {
      setIsLoadingBusinesses(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/google/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.reviews || []);
        toast.success(`Fetched ${data.total_count} reviews`);
      } else {
        throw new Error('Failed to fetch business locations');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch business locations');
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/Reviewslytics.svg" alt="Reviewslytics Logo" width={150} height={40} />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.full_name}</span>
              <div className="w-8 h-8 bg-[#FF8000] rounded-full flex items-center justify-center text-white font-medium">
                {user?.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Google Business Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">Connect Your Business</h2>
          
          {/* حالة عدم وجود حساب مرتبط */}
          {!businesses.length && (
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                Connect your Google Business Profile to analyze your reviews
              </div>
              <button 
                onClick={handleGoogleLink}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Connect Google Business Profile
              </button>
            </div>
          )}

          {/* حالة وجود حساب مرتبط */}
          {businesses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    Connected
                  </div>
                  <span className="text-gray-600">
                    {businesses.length} business locations connected
                  </span>
                </div>
                <button
                  onClick={fetchBusinessLocations}
                  disabled={isLoadingBusinesses}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLoadingBusinesses
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-[#FF8000] hover:bg-[#e67300] text-white'
                  }`}
                >
                  {isLoadingBusinesses ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading Reviews...
                    </div>
                  ) : (
                    'Refresh Reviews'
                  )}
                </button>
              </div>

              {/* عرض المراجعات */}
              <div className="space-y-6">
                {businesses.map((business, index) => (
                  <div key={index} className="border rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{business.locationName}</h3>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < business.starRating 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-gray-600">
                            {new Date(business.createTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{business.comment}</p>
                  </div>
                ))}

                {businesses.length === 0 && !isLoadingBusinesses && (
                  <div className="text-center text-gray-500 py-8">
                    No reviews found. Click "Refresh Reviews" to load your business reviews.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">Upload Reviews</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose File Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setUploadType('json')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadType === 'json' 
                      ? 'bg-[#FF8000] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setUploadType('csv')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    uploadType === 'csv' 
                      ? 'bg-[#FF8000] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={uploadType === 'json' ? '.json' : '.csv'}
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-[#FF8000] file:text-white
                  hover:file:bg-[#e67300]
                  transition-colors"
              />
              {isUploading && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="animate-pulse">Uploading file...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Files Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Files</h2>
          <div className="divide-y divide-gray-100">
            {savedFiles.map((file) => (
              <div key={file.id} className="py-4 flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => handleFileSelection(file.id)}
                  className="h-4 w-4 text-[#FF8000] focus:ring-[#FF8000] border-gray-300 rounded"
                />
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{file.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(file.uploadDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-sm font-medium text-[#FF8000]">
                  {file.reviewCount} reviews
                </div>
                <button
                  onClick={() => handleDeleteClick(file)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {savedFiles.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No files uploaded yet
              </div>
            )}
          </div>
        </div>

        {/* Analysis Type Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">Choose Analysis Type</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Analysis Option */}
            <div 
              className={`border rounded-xl p-6 cursor-pointer transition-colors ${
                selectedAnalysisType === 'free' ? 'border-[#FF8000] border-2' : 'border-gray-200'
              }`}
              onClick={() => setSelectedAnalysisType('free')}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium">Free Analysis</h3>
                <span className="text-[#FF8000] font-semibold">$0</span>
              </div>
              <ul className="space-y-2 text-gray-600 mb-4">
                <li>• Basic sentiment analysis</li>
                <li>• Simple topic extraction</li>
                <li>• Using open-source AI</li>
                <li>• Limited processing</li>
              </ul>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnalysisType('free');
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  selectedAnalysisType === 'free'
                    ? 'bg-[#FF8000] text-white hover:bg-[#e67300]'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Select Free
              </button>
            </div>

            {/* Premium Analysis Option */}
            <div 
              className={`border rounded-xl p-6 cursor-pointer transition-colors ${
                selectedAnalysisType === 'premium' ? 'border-[#FF8000] border-2' : 'border-gray-200'
              }`}
              onClick={() => setSelectedAnalysisType('premium')}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium">Premium Analysis</h3>
                <span className="text-[#FF8000] font-semibold">Advanced</span>
              </div>
              <ul className="space-y-2 text-gray-600 mb-4">
                <li>• Deep sentiment analysis</li>
                <li>• Advanced topic clustering</li>
                <li>• Using GPT-3.5/4</li>
                <li>• Detailed recommendations</li>
              </ul>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnalysisType('premium');
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  selectedAnalysisType === 'premium'
                    ? 'bg-[#FF8000] text-white hover:bg-[#e67300]'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Select Premium
              </button>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleAnalyze}
            disabled={isUploading || !selectedFiles.size || !selectedAnalysisType}
            className={`
              px-16 py-4 rounded-xl text-xl font-medium transition-colors
              ${(isUploading || !selectedFiles.size || !selectedAnalysisType)
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-[#FF8000] hover:bg-[#e67300] text-white'
              }
            `}
          >
            {isUploading ? 'Processing...' : 'Analyze Reviews'}
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Summary</h3>
                <p className="text-gray-700">{analysisResults.summary}</p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Sentiment Analysis</h3>
                <pre className="bg-gray-50 p-4 rounded-xl">
                  {JSON.stringify(analysisResults.sentiment_analysis, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Topics</h3>
                <pre className="bg-gray-50 p-4 rounded-xl">
                  {JSON.stringify(analysisResults.topics, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            if (selectedFile) {
              handleFileDelete(selectedFile.id);
              setShowDeleteConfirm(false);
            }
          }}
          fileName={selectedFile?.fileName || ''}
          reviewCount={selectedFile?.reviewCount || 0}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
} 