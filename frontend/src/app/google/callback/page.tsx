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
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error in Google callback:', error);
          router.push('/dashboard?error=google_link_failed');
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Linking your Google account...</p>
    </div>
  );
} 