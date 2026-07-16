import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, loading, isLoading } = useAuth();
  const location = useLocation();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0F2B5B] text-white flex items-center justify-center shadow-lg mb-4">
          <ShieldCheck className="w-6 h-6 text-[#F97316]" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-[#1D4ED8] mb-2" />
        <p className="text-sm font-extrabold text-[#0F2B5B]">Verifying Citizen Credentials...</p>
        <p className="text-xs text-gray-500 mt-1">Please wait while your secure session is authenticated</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
