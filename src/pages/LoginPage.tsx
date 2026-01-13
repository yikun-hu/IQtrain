// 翻译改造后的完整前端代码
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
  const { t } = useLanguage();
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
        title: t.common.error,
        description: t.login.validation.invalidEmail,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithOTP(email);
      setStep('code');
      toast({
        title: t.common.success,
        description: t.login.success.codeSent,
      });
    } catch (error: any) {
      toast({
        title: t.common.error,
        description: error.message || t.login.errorMessage,
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
        title: t.common.error,
        description: t.login.validation.invalidCode,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, code);
      toast({
        title: t.common.success,
        description: t.login.success.loginSuccess,
      });
      navigate('/dashboard');
    } catch {
      toast({
        title: t.common.error,
        description: t.login.validation.invalidCodeError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.login.title}
          </h1>
          <p className="text-gray-600">
            {t.login.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  {t.login.emailLabel}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.login.emailPlaceholder}
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
                {t.login.sendCodeButton}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                {t.login.noAccountPrefix}{' '}
                <Link
                  to="/test"
                  className="text-primary font-semibold hover:underline"
                >
                  {t.login.noAccountLink}
                </Link>{' '}
                {t.login.noAccountSuffix}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 font-medium">
                  {t.login.verificationCodeLabel}
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={t.login.codePlaceholder}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  maxLength={6}
                  className="h-12 text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500">
                  {t.login.codeSentTo}
                  {email}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t.login.verifyButton}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => setStep('email')}
              >
                {t.login.backButton}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}