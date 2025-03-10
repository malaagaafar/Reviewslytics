'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalysisLoading({ analysisId }: { analysisId: string }) {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/analysis/status/${analysisId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'completed') {
            router.push(`/dashboard/analysis/${analysisId}`);
          } else if (data.status === 'error') {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking analysis status:', error);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [analysisId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-32 h-32 relative">
        <div className="w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="w-full h-full border-4 border-black rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
      </div>
      <h2 className="mt-8 text-2xl font-medium">Analyzing Your Reviews</h2>
      <p className="mt-2 text-gray-600">This might take a few moments...</p>
    </div>
  );
} 