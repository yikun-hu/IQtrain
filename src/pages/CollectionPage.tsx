import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Shield, Clock, Zap, Brain } from 'lucide-react';

export default function CollectionPage() {
  const { language, t } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const hasCompleteProfile =
    user &&
    profile?.full_name &&
    profile?.age &&
    profile?.gender &&
    profile?.email;

  const isSubscribed =
    profile?.has_paid &&
    profile?.subscription_type &&
    (!profile?.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tCollection = t.collection;

  useEffect(() => {
    const testAnswers = localStorage.getItem('testAnswers');
    if (!testAnswers) {
      toast({
        title: t.common.error,
        description: tCollection.testAnswerMissing,
        variant: 'destructive',
      });
      navigate('/test');
      return;
    }

    if (hasCompleteProfile && isSubscribed) {
      localStorage.setItem(
        'userInfo',
        JSON.stringify({
          fullName: profile?.full_name || '',
          age: profile?.age || 0,
          gender: profile?.gender || '',
          email: profile?.email || '',
        }),
      );
      navigate('/result');
    }

    if (hasCompleteProfile && !isSubscribed) {
      setFullName(profile?.full_name || '');
      setAge(profile?.age ? String(profile.age) : '');
      setGender(profile?.gender || '');
      setEmail(profile?.email || '');
      setStep(2);
    }
  }, [language]);

  const durationSec = Number(localStorage.getItem('testTimeTaken') || 0);
  const m = Math.floor(durationSec / 60);
  const s = durationSec % 60;
  const completionTime = `${m}m ${String(s).padStart(2, '0')}s`;

  const strongestSkill =
    localStorage.getItem('iqTestStrongestSkill') || 'Logical Reasoning';

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !age || !gender) return;
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email) || !agreedToPrivacy) return;

    setSubmitting(true);
    try {
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ fullName, age, gender, email }),
      );
      navigate(isSubscribed ? '/results' : '/payment');
    } catch {
      toast({
        title: t.common.error,
        description: tCollection.saveInfoFailed,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4 pt-24">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardDescription>{tCollection.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <Label>{tCollection.step2.email}</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tCollection.step2.emailPlaceholder}
              />

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={agreedToPrivacy}
                  onCheckedChange={(v) => setAgreedToPrivacy(Boolean(v))}
                />
                <Label className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  {tCollection.step2.privacy}
                  <Link to="/privacy-policy" target="_blank">
                    {tCollection.step2.privacyLink}
                  </Link>
                </Label>
              </div>

              <Button disabled={submitting}>
                {submitting ? tCollection.submitting : tCollection.step2.submit}
              </Button>

              <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                <div>
                  <Clock />
                  <div>{tCollection.metrics.completionTime}</div>
                  <div>{completionTime}</div>
                </div>
                <div>
                  <Zap />
                  <div>{tCollection.metrics.fasterThan}</div>
                  <div>{tCollection.metrics.fasterThanValue}</div>
                </div>
                <div>
                  <Brain />
                  <div>{tCollection.metrics.strongestSkill}</div>
                  <div>{strongestSkill}</div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
