import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { signInWithOTP, verifyOTP } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithOTP(email);
      setStep('code');
      toast({
        title: language === 'zh' ? '成功' : 'Success',
        description: language === 'zh' ? '验证码已发送' : 'Verification code sent',
      });
    } catch (error: any) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: error.message || (language === 'zh' ? '发送验证码失败' : 'Failed to send verification code'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '请输入有效的6位验证码' : 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, code);
      toast({
        title: language === 'zh' ? '成功' : 'Success',
        description: language === 'zh' ? '登录成功' : 'Login successful',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '验证码错误' : 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'zh' ? '登录 IQ Train' : 'Login to IQ Train'}
          </h1>
          <p className="text-gray-600">
            {language === 'zh' 
              ? '输入您的邮箱以接收验证码' 
              : 'Enter your email to receive a verification code'}
          </p>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  {language === 'zh' ? '邮箱地址' : 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {language === 'zh' ? '发送验证码' : 'Send Code'}
              </Button>
              
              {/* 提示信息 - 移到Send Code按钮下方 */}
              <div className="text-center text-sm text-gray-600 mt-4">
                {language === 'zh' ? (
                  <>
                    没有账号？请先
                    <Link to="/test" className="text-primary font-semibold hover:underline ml-1">
                      开始测试
                    </Link>
                  </>
                ) : (
                  <>
                    No account yet? Please{' '}
                    <Link to="/test" className="text-primary font-semibold hover:underline">
                      start a quiz
                    </Link>
                    {' '}first
                  </>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 font-medium">
                  {language === 'zh' ? '验证码' : 'Verification Code'}
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-12 text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500">
                  {language === 'zh' ? '验证码已发送至：' : 'Code sent to: '}{email}
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {language === 'zh' ? '验证' : 'Verify'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => setStep('email')}
              >
                {language === 'zh' ? '返回' : 'Back'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}