'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ReferralPage({ params }: { params: { username: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const verifyUsername = async () => {
      try {
        const response = await fetch('/api/auth/verify-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: params.username }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.exists) {
            setUserExists(true);
            // Redirect to signup page with sponsor parameter
            const url = `/?sponsor=${encodeURIComponent(params.username)}`;
            router.replace(url);
          } else {
            setError('User does not exist');
            setUserExists(false);
          }
        } else {
          setError('Failed to verify username');
          setUserExists(false);
        }
      } catch (error) {
        console.error('Error verifying username:', error);
        setError('An error occurred while verifying the username');
        setUserExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUsername();
  }, [params.username, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Verifying referral link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <h1 className="text-xl font-bold text-white mb-2">Invalid Referral Link</h1>
            <p className="text-red-300 mb-4">{error}</p>
            <p className="text-slate-400 text-sm">
              The user <span className="text-yellow-400 font-medium">{params.username}</span> does not exist in our system.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Go to Signup Page
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full bg-slate-700/50 text-slate-300 font-medium py-3 px-6 rounded-xl hover:bg-slate-600/50 transition-all duration-300 border border-slate-600/50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
