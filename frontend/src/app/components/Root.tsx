import { Outlet } from 'react-router';
import { LanguageProvider } from '@/app/context/LanguageContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { UserDataProvider } from '@/app/context/UserDataContext';

export function Root() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UserDataProvider>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
            <Outlet />
          </div>
        </UserDataProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}