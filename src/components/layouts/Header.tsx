import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SupportedLanguages, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { signOut, cancelSubscription } from '@/db/api';
import {
  User,
  FileCheck,
  FileText,
  LogOut,
  Globe,
  LayoutDashboard,
  Mail,
  Bell,
  Gamepad2,
  ClipboardList,
  Shield,
  CreditCard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Language } from '@/types/types';

export default function Header() {
  const { language, setLanguage, t } = useLanguage() as any;
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('training');
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error(t.header.logout_failed, error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setIsUnsubscribing(true);
    try {
      await cancelSubscription(user.id);
      await refreshProfile(); // 刷新用户资料
      setShowUnsubscribeDialog(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(t.header.unsubscribe_failed, error);
      setErrorMessage(t.header.unsubscribe_failed_retry);
      setShowUnsubscribeDialog(false);
      setShowErrorModal(true);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'training') {
      navigate('/dashboard?tab=training');
    } else if (tab === 'tests') {
      navigate('/dashboard?tab=tests');
    }
    const event = new CustomEvent('dashboard-tab-change', { detail: tab });
    window.dispatchEvent(event);
    setActiveTab(tab);
  };

  const isDashboard = location.pathname.startsWith('/dashboard');
  const showNav = location.pathname.startsWith('/result') || location.pathname.startsWith('/scale');
  const alwaysShowNav = user;

  useEffect(() => {
    if (location.pathname.startsWith('/result')) {
      setActiveTab('tests');
    } else if (location.pathname.startsWith('/dashboard')) {
      const tabParam = searchParams.get('tab');
      if (tabParam && (tabParam === 'training' || tabParam === 'tests')) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('training');
      }
    } else {
      setActiveTab('');
    }
  }, [location, searchParams]);

  const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧Logo */}
            <Link to="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              <img src="/images/logo/iqtrain-logo1-white.png" alt="IQ Train" className="h-12" />
            </Link>

            {/* 中间导航 - 登录后始终显示 */}
            {alwaysShowNav && (
              <div className="flex items-center gap-8 hidden md:flex">
                <button
                  onClick={() => handleTabChange('training')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 font-semibold transition-all ${activeTab === 'training' ? 'text-white' : 'text-white/70 hover:text-white/90'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    <span>{t.header.tab_training}</span>
                  </div>
                  <div
                    className={`w-full h-0.5 rounded-full transition-colors ${activeTab === 'training' ? 'bg-white' : 'bg-transparent'
                      }`}
                  />
                </button>

                <button
                  onClick={() => handleTabChange('tests')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 font-semibold transition-all ${activeTab === 'tests' ? 'text-white' : 'text-white/70 hover:text-white/90'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    <span>{t.header.tab_tests}</span>
                  </div>
                  <div
                    className={`w-full h-0.5 rounded-full transition-colors ${activeTab === 'tests' ? 'bg-white' : 'bg-transparent'
                      }`}
                  />
                </button>
              </div>
            )}

            {/* 右侧功能区 */}
            <div className="flex items-center gap-4">
              {/* 语言切换 */}
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SupportedLanguages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 用户功能 - 仅登录用户显示 */}
              {user && profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t.header.admin}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=training')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t.header.dashboard}</span>
                    </DropdownMenuItem>

                    {hasSubscription ? null : <DropdownMenuSeparator />}

                    {hasSubscription ? null : (
                      <DropdownMenuItem onClick={() => navigate('/pricing')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>{t.header.pricing}</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* <DropdownMenuItem onClick={() => navigate('/privacy-policy')}>
                      <FileCheck className="mr-2 h-4 w-4" />
                      <span>{t.header.privacy_policy}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/terms')}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t.header.terms_of_service}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/cookie-policy')}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t.header.cookie_policy}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator /> */}

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.header.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate('/login')}
                >
                  {t.header.login}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 退订确认对话框 */}
      <AlertDialog open={showUnsubscribeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.header.confirm_unsubscribe_title}</AlertDialogTitle>
            <AlertDialogDescription>{t.header.confirm_unsubscribe_desc}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsubscribeDialog(false)}>
              {t.header.cancel}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUnsubscribing ? t.header.processing : t.header.confirm_unsubscribe_action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 错误提示对话框 */}
      <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">{t.header.error}</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorModal(false)}>
              {t.header.ok}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 成功提示对话框 */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-500">{t.header.success}</AlertDialogTitle>
            <AlertDialogDescription>{t.header.unsubscribe_success}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              {t.header.ok}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
