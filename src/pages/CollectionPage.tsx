import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Shield } from 'lucide-react';

export default function CollectionPage() {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if user has complete profile information
  const hasCompleteProfile = user && 
                           profile?.full_name && 
                           profile?.age && 
                           profile?.gender && 
                           profile?.email;
  
  // Check if user is already a subscribed user
  const isSubscribed = profile?.has_paid && 
                      profile?.subscription_type && 
                      (!profile?.subscription_expires_at || 
                       new Date(profile.subscription_expires_at) > new Date());

  // 当前步骤：1 或 2
  const [step, setStep] = useState(1);

  // 第一步：姓名、性别、年龄
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // 第二步：邮箱、隐私政策同意
  const [email, setEmail] = useState(user?.email || '');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 检查是否有测试答案
    const testAnswers = localStorage.getItem('testAnswers');
    if (!testAnswers) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '未找到测试答案，请先完成测试' : 'No test answers found, please complete the test first',
        variant: 'destructive',
      });
      navigate('/test');
      return;
    }
    
    // 如果用户有完整个人信息且已经是订阅用户，直接跳转到结果页面
    if (hasCompleteProfile && isSubscribed) {
      // 保存用户信息到localStorage
      const userInfo = {
        fullName: profile?.full_name || '',
        age: profile?.age || 0,
        gender: profile?.gender || '',
        email: profile?.email || '',
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 直接跳转到结果页面
      navigate('/result');
    }
    
    // 如果用户有完整个人信息但不是订阅用户，跳过第一步直接进入邮箱确认
    if (hasCompleteProfile && !isSubscribed) {
      // 预填充用户信息
      setFullName(profile?.full_name || '');
      setAge(profile?.age?.toString() || '');
      setGender(profile?.gender || '');
      setEmail(profile?.email || '');
      
      // 直接进入第二步
      setStep(2);
    }
  }, [language, navigate, toast, hasCompleteProfile, isSubscribed, profile, setFullName, setAge, setGender, setEmail]);

  const content = {
    zh: {
      description: '请填写您的基本信息以获取个性化的IQ报告',
      step1: {
        fullName: '姓名',
        fullNamePlaceholder: '请输入您的姓名',
        age: '年龄',
        agePlaceholder: '请输入您的年龄',
        gender: '性别',
        genderPlaceholder: '请选择性别',
        male: '男',
        female: '女',
        other: '其他',
        continue: '继续',
        fillAll: '请填写完整信息',
        fillAllDesc: '姓名、年龄和性别都是必填的',
      },
      step2: {
        email: '邮箱地址',
        emailPlaceholder: '请输入您的邮箱',
        privacy: '我已阅读并同意',
        privacyLink: '隐私政策',
        submit: '获取报告',
        fillEmail: '请填写邮箱',
        fillEmailDesc: '邮箱地址是必填的',
        agreePrivacy: '请同意隐私政策',
        agreePrivacyDesc: '您需要同意隐私政策才能继续',
        invalidEmail: '邮箱格式不正确',
        invalidEmailDesc: '请输入有效的邮箱地址',
      },
    },
    en: {
      description: 'Please fill in your basic information to get a personalized IQ report',
      step1: {
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        age: 'Age',
        agePlaceholder: 'Enter your age',
        gender: 'Gender',
        genderPlaceholder: 'Select your gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        continue: 'Continue',
        fillAll: 'Please fill in all fields',
        fillAllDesc: 'Name, age and gender are required',
      },
      step2: {
        email: 'Email Address',
        emailPlaceholder: 'Enter your email',
        privacy: 'I have read and agree to the',
        privacyLink: 'Privacy Policy',
        submit: 'Get Report',
        fillEmail: 'Please fill in email',
        fillEmailDesc: 'Email address is required',
        agreePrivacy: 'Please agree to privacy policy',
        agreePrivacyDesc: 'You need to agree to the privacy policy to continue',
        invalidEmail: 'Invalid email format',
        invalidEmailDesc: 'Please enter a valid email address',
      },
    },
  };

  const t = content[language];

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 处理第一步提交
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !age || !gender) {
      toast({
        title: t.step1.fillAll,
        description: t.step1.fillAllDesc,
        variant: 'destructive',
      });
      return;
    }

    // 进入第二步
    setStep(2);
  };

  // 处理第二步提交
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t.step2.fillEmail,
        description: t.step2.fillEmailDesc,
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: t.step2.invalidEmail,
        description: t.step2.invalidEmailDesc,
        variant: 'destructive',
      });
      return;
    }

    if (!agreedToPrivacy) {
      toast({
        title: t.step2.agreePrivacy,
        description: t.step2.agreePrivacyDesc,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
        // 保存用户信息到localStorage
        const userInfo = {
          fullName,
          age: parseInt(age),
          gender,
          email,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // 如果用户已经是订阅用户，直接跳转到结果页面
        if (isSubscribed) {
          navigate('/results');
        } else {
          // 跳转到支付页面
          navigate('/payment');
        }
    } catch (error) {
      console.error('保存用户信息失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '保存信息失败，请重试' : 'Failed to save information, please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl relative z-10 border-2">
        <CardHeader className="text-center">
          <CardDescription className="text-base">
            {t.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 第一步：基本信息 */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-semibold">
                  {t.step1.fullName}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t.step1.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* 年龄 */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-semibold">
                  {t.step1.age}
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder={t.step1.agePlaceholder}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* 性别 */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold">
                  {t.step1.gender}
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder={t.step1.genderPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.step1.male}</SelectItem>
                    <SelectItem value="female">{t.step1.female}</SelectItem>
                    <SelectItem value="other">{t.step1.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 下一步按钮 */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {t.step1.continue}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          )}

          {/* 第二步：邮箱和隐私政策 */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* 邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  {t.step2.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.step2.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                />
                
                {/* 隐私政策同意 - 放在邮箱输入框下方 */}
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="privacy"
                    checked={agreedToPrivacy}
                    onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="privacy"
                    className="text-sm font-medium leading-relaxed cursor-pointer flex items-center gap-1 flex-wrap"
                  >
                    <Shield className="h-4 w-4 text-primary inline" />
                    {t.step2.privacy}{' '}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-primary hover:underline font-semibold"
                    >
                      {t.step2.privacyLink}
                    </Link>
                  </Label>
                </div>
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                disabled={submitting || !agreedToPrivacy}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {language === 'zh' ? '提交中...' : 'Submitting...'}
                  </>
                ) : (
                  t.step2.submit
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
