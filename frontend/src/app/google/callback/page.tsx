'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
            router.push('/dashboard');
          } else {
            console.error('Error linking Google account');
            router.push('/dashboard?error=google_link_failed');
          }
        } catch (error) {
          console.error('Error:', error);
          router.push('/dashboard?error=google_link_failed');
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Linking your Google Business Profile...</h2>
        <p>Please wait while we complete the process.</p>
      </div>
    </div>
  );
} 