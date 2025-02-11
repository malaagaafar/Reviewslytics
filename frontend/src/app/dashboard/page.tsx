'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // التحقق من وجود المستخدم في localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userStr));
  }, []);

  const handleGoogleLink = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/google', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;  // توجيه المستخدم إلى Google
      }
    } catch (error) {
      console.error('Error linking Google account:', error);
      alert('Error linking Google account');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold">
              Reviewslytics
            </Link>
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-12">
          Hello, {user.full_name}
        </h1>

        {/* Google Link Button */}
        <div className="flex justify-center mb-12">
          <button 
            onClick={handleGoogleLink}
            className="bg-gray-200 hover:bg-gray-300 text-black px-8 py-3 rounded-full text-lg font-medium transition-colors"
          >
            Link Google Business Profile
          </button>
        </div>

        {/* Locations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select Locations</h2>
          <div className="border rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Business Location 1 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <p className="text-lg">Business Name</p>
              </div>
              
              {/* Business Location 2 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <p className="text-lg">Business Name</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <button className="border-2 border-black hover:bg-gray-50 text-black px-6 py-3 rounded-lg text-lg font-medium transition-colors">
            Upload Names
          </button>
          <button className="border-2 border-black hover:bg-gray-50 text-black px-6 py-3 rounded-lg text-lg font-medium transition-colors">
            Upload Names
          </button>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center">
          <button className="bg-[#00FF1A] hover:bg-[#00CC15] text-black px-16 py-4 rounded-full text-2xl font-medium transition-colors">
            Analyze
          </button>
        </div>
      </main>
    </div>
  );
} 