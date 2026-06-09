'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      if (requiredRole && userRole !== requiredRole) {
        // Redirect to correct portal
        router.push(userRole === 'admin' ? '/admin/dashboard' : '/learner/dashboard');
      }
    }
  }, [user, userRole, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading WebZero LMS...</p>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && userRole !== requiredRole) return null;

  return <>{children}</>;
}
