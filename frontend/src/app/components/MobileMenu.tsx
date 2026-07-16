import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Menu, GraduationCap, FileText, Briefcase, MessageCircle, User, LogOut, Home, Landmark } from 'lucide-react';

export function MobileMenu() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: t('dashboard') || 'Dashboard', path: '/dashboard' },
    { icon: GraduationCap, label: t('studentSupport') || 'Student Support', path: '/student-support' },
    { icon: FileText, label: t('govSchemes') || 'Government Schemes', path: '/government-schemes' },
    { icon: Briefcase, label: t('careerGuidance') || 'Career Guidance', path: '/career-guidance' },
    { icon: MessageCircle, label: t('aiAssistant') || 'AI Assistant', path: '/chat' },
    { icon: User, label: t('profile') || 'Citizen Profile', path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-[#0F2B5B]">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-white text-[#0F172A]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2B5B] to-[#1D4ED8] flex items-center justify-center shadow-md">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-[#0F2B5B]">
              SARTHI
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1.5">
          {isAuthenticated ? (
            <>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start gap-3 font-bold text-xs text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] rounded-xl py-5"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Icon className="w-4 h-4 text-[#1D4ED8]" />
                    {item.label}
                  </Button>
                );
              })}

              <div className="border-t border-gray-100 my-3" />

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl py-5 font-bold text-xs"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Secure Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <p className="text-xs text-gray-500 font-semibold px-1">
                Authentication Required to access Portal Services.
              </p>
              <Button
                variant="outline"
                className="w-full justify-center font-bold text-xs rounded-xl h-11 border-gray-300 text-[#0F2B5B]"
                onClick={() => handleNavigation('/login')}
              >
                Citizen Login
              </Button>
              <Button
                className="w-full bg-[#0F2B5B] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl h-11 shadow-md"
                onClick={() => handleNavigation('/signup')}
              >
                Register Citizen ID
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
