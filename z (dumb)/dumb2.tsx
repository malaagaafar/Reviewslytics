'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
}

type AnalysisType = 'free' | 'premium' | null;

export default function Dashboard() {
  const router = useRouter();
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
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!selectedFiles.length) {
      toast.error('Please select files to analyze');
      return;
    }
    
    if (!selectedAnalysisType) {
      toast.error('Please select an analysis type');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsUploading(true);
      
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

      if (response.ok) {
        const data = await response.json();
        setAnalysisId(data.analysis_id);
        router.push(`/dashboard/analysis/loading?id=${data.analysis_id}`);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
    } finally {
      setIsUploading(false);
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
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Google Link Button */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">Connect Your Business</h2>
          <button 
            onClick={handleGoogleLink}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Google Business Profile
          </button>
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
                    {new Date(file.uploadDate).toLocaleDateString('ar-SA', {
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
              onClick={() => setSelectedAnalysisType('free')}
              className="border rounded-xl p-6 cursor-pointer hover:border-[#FF8000] transition-colors"
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
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                Select Free
              </button>
            </div>

            {/* Premium Analysis Option */}
            <div 
              onClick={() => setSelectedAnalysisType('premium')}
              className="border rounded-xl p-6 cursor-pointer hover:border-[#FF8000] transition-colors"
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
              <button className="w-full py-2 bg-[#FF8000] text-white hover:bg-[#e67300] rounded-lg font-medium transition-colors">
                Select Premium
              </button>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleAnalyze}
            disabled={isUploading || analysisStatus === 'processing' || !selectedFiles.size || !selectedAnalysisType}
            className={`
              px-16 py-4 rounded-xl text-xl font-medium transition-colors
              ${(isUploading || analysisStatus === 'processing' || !selectedFiles.size || !selectedAnalysisType)
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-[#FF8000] hover:bg-[#e67300] text-white'
              }
            `}
          >
            {analysisStatus === 'processing' ? 'Analyzing...' : 'Analyze Reviews'}
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