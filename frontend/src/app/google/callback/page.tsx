'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code && state) {
        try {
          const response = await fetch(`http://localhost:8000/api/auth/google/callback?code=${code}&state=${state}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Google account linked successfully:', data);
            toast.success('Google Business Profile connected successfully');
            
            // بعد نجاح الربط، نقوم بجلب المراجعات مباشرة
            try {
              const reviewsResponse = await fetch('http://localhost:8000/api/auth/google/reviews', {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();
                // تخزين المراجعات في localStorage لاستخدامها في صفحة Dashboard
                localStorage.setItem('googleReviews', JSON.stringify(reviewsData.reviews));
              }
            } catch (error) {
              console.error('Error fetching initial reviews:', error);
            }

            router.push('/dashboard?connected=true');
          } else {
            console.error('Error linking Google account');
            toast.error('Failed to connect Google Business Profile');
            router.push('/dashboard?error=google_link_failed');
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('Failed to connect Google Business Profile');
          router.push('/dashboard?error=google_link_failed');
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-12 h-12 border-4 border-[#FF8000] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Connecting your Google Business Profile...</h2>
        <p className="text-gray-600">Please wait while we complete the process.</p>
      </div>
    </div>
  );
} 