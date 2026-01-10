import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { signOut, cancelSubscription } from '@/db/api';
import { User, Lock, FileCheck, FileText, LogOut, Globe, LayoutDashboard, Mail, Bell, Gamepad2, ClipboardList, Shield, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('training');
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;
    
    setIsUnsubscribing(true);
    try {
      await cancelSubscription(user.id);
      await refreshProfile(); // 刷新用户资料
      toast({
        title: language === 'zh' ? '成功' : 'Success',
        description: language === 'zh' ? '已成功取消订阅' : 'Subscription cancelled successfully',
      });
      setShowUnsubscribeDialog(false);
    } catch (error) {
      console.error('取消订阅失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '取消订阅失败，请稍后重试' : 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'en' | 'zh');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const event = new CustomEvent('dashboard-tab-change', { detail: tab });
    window.dispatchEvent(event);
  };

  // 判断是否在Dashboard页面
  const isDashboard = location.pathname === '/dashboard';
  
  // 判断用户是否有订阅
  const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
  
  // 判断用户是否是管理员
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧Logo */}
          <Link to="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
            IQ Train
          </Link>

          {/* 中间导航 - 仅在Dashboard页面显示 */}
          {isDashboard && user && (
            <div className="flex items-center gap-8">
              <button
                onClick={() => handleTabChange('training')}
                className={`flex flex-col items-center gap-1 px-4 py-2 font-semibold transition-all ${
                  activeTab === 'training'
                    ? 'text-white'
                    : 'text-white/70 hover:text-white/90'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  <span>Training</span>
                </div>
                {activeTab === 'training' && (
                  <div className="w-full h-0.5 bg-white rounded-full" />
                )}
              </button>
              <button
                onClick={() => handleTabChange('tests')}
                className={`flex flex-col items-center gap-1 px-4 py-2 font-semibold transition-all ${
                  activeTab === 'tests'
                    ? 'text-white'
                    : 'text-white/70 hover:text-white/90'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  <span>Tests</span>
                </div>
                {activeTab === 'tests' && (
                  <div className="w-full h-0.5 bg-white rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* 右侧功能区 */}
          <div className="flex items-center gap-4">
            {/* 语言切换 */}
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
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
                  {/* 用户邮箱显示 */}
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Admin按钮 - 仅管理员可见 */}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>{language === 'zh' ? '管理后台' : 'Admin'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Dashboard按钮 */}
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? '仪表盘' : 'Dashboard'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/reset-password')}>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? '重设密码' : 'Reset Password'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* 订阅/退订按钮 */}
                  {hasSubscription ? (
                    <DropdownMenuItem onClick={() => setShowUnsubscribeDialog(true)}>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>{language === 'zh' ? '退订' : 'Unsubscribe'}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/pricing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>{language === 'zh' ? '订阅' : 'Subscribe'}</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/privacy-policy')}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? '隐私政策' : 'Privacy Policy'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/terms')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? '用户协议' : 'Terms of Service'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/cookie-policy')}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? 'Cookie政策' : 'Cookie Policy'}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{language === 'zh' ? '登出' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 未登录用户显示登录按钮
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/login')}
              >
                {language === 'zh' ? '登录' : 'Login'}
              </Button>
            )}
          </div>
        </div>
      </div>
      </header>

      {/* 退订确认对话框 */}
      <AlertDialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'zh' ? '确认取消订阅' : 'Confirm Unsubscribe'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'zh' 
                ? '您确定要取消订阅吗？取消后您将失去所有订阅权益，包括专业训练课程和定期测评。' 
                : 'Are you sure you want to cancel your subscription? You will lose access to all subscription benefits, including professional training courses and regular assessments.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnsubscribing}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUnsubscribing 
                ? (language === 'zh' ? '处理中...' : 'Processing...') 
                : (language === 'zh' ? '确认退订' : 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
