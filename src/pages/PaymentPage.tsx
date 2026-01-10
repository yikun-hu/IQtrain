import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  createOrder,
  updateProfile,
  saveTestResult,
  getAllQuestions,
  getSubscriptionPlan,
  getPaymentGatewayConfig,
  signInWithOTP,
  verifyOTP,
} from '@/db/api';
import type { SubscriptionType, TestDimension, SubscriptionPlan, PaymentGatewayConfig } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  CheckCircle,
  FileText,
  Award,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { supabase } from '@/db/supabase';
import { PayPalButtons } from '@paypal/react-paypal-js';

// ✅ 新增：Dialog 组件（shadcn/ui）
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// 随机生成购买横幅数据
const generatePurchaseBanners = () => {
  const names = [
    'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emma Davis',
    'James Wilson', 'Olivia Martinez', 'Robert Anderson', 'Sophia Taylor',
    'William Thomas', 'Isabella Moore', 'John Jackson', 'Mia White',
    'Daniel Harris', 'Charlotte Martin', 'Matthew Thompson', 'Amelia Garcia',
    'Joseph Rodriguez', 'Harper Lewis', 'Christopher Lee', 'Evelyn Walker',
  ];

  const chineseNames = [
    '张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵敏', '黄磊',
    '周杰', '吴倩', '徐强', '孙丽', '马超', '朱婷', '胡军', '郭敏',
    '林峰', '何洁', '高阳', '罗文',
  ];

  return names.map((name, index) => ({
    name,
    chineseName: chineseNames[index],
    iq: Math.floor(Math.random() * (145 - 95) + 95),
  }));
};

export default function PaymentPage() {
  const { language } = useLanguage();
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(6 * 60 + 26); // 6:26
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [purchaseBanners] = useState(generatePurchaseBanners());
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // OTP verification state
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  // 从URL获取plan_id，如果没有则使用旧的type参数
  const planId = searchParams.get('plan_id');
  const type = (searchParams.get('type') as SubscriptionType) || 'one_time';
  const amount = type === 'one_time' ? 1.98 : 28.8;
  const monthlyPrice = 28.8;

  // 加载订阅包和支付网关配置
  useEffect(() => {
    const loadPlanAndConfig = async () => {
      try {
        setLoadingPlan(true);

        const [planData, configData] = await Promise.all([
          planId ? getSubscriptionPlan(planId) : getSubscriptionPlan('7b4640d2-c81c-4132-b1c6-9eea66fe66cd'),
          getPaymentGatewayConfig(),
        ]);

        if (planData) setSelectedPlan(planData);
        if (configData) setGatewayConfig(configData);
      } catch (error) {
        console.error('加载订阅包或支付网关配置失败:', error);
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '加载订阅信息失败' : 'Failed to load subscription info',
          variant: 'destructive',
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlanAndConfig();
  }, [planId, language, toast]);

  // 获取时间单位标签
  const getTimeUnitLabel = (unit: string, duration: number) => {
    const labels: Record<string, { zh: string; en: string }> = {
      DAY: { zh: '天', en: duration > 1 ? 'days' : 'day' },
      WEEK: { zh: '周', en: duration > 1 ? 'weeks' : 'week' },
      MONTH: { zh: '月', en: duration > 1 ? 'months' : 'month' },
      YEAR: { zh: '年', en: duration > 1 ? 'years' : 'year' },
    };
    return labels[unit]?.[language] || unit;
  };

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 购买横幅轮播
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % purchaseBanners.length);
    }, 3000);

    return () => clearInterval(bannerTimer);
  }, [purchaseBanners.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP handling functions
  const handleSendOTPCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpEmail || !otpEmail.includes('@')) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setOtpLoading(true);
    try {
      await signInWithOTP(otpEmail);
      setOtpStep('code');
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
      setOtpLoading(false);
    }
  };

  const [toProcessPaymentSuccess, setToProcessPaymentSuccess] = useState(false);
  useEffect(() => {
    if (toProcessPaymentSuccess && !authLoading) processPaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toProcessPaymentSuccess, authLoading]);

  const handleVerifyOTPCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '请输入有效的6位验证码' : 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setOtpLoading(true);
    try {
      const data = await verifyOTP(otpEmail, otpCode);

      if (data?.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await refreshProfile();

      // ✅ 关闭弹窗（不再切换整页）
      setShowOtpForm(false);

      // Proceed with payment process
      setToProcessPaymentSuccess(true);
    } catch (error: any) {
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '验证码错误' : 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const calculateIQScore = (answers: Record<number, string>, questions: any[]) => {
    let correctCount = 0;
    const dimensionScores: Record<TestDimension, { correct: number; total: number }> = {
      memory: { correct: 0, total: 0 },
      speed: { correct: 0, total: 0 },
      reaction: { correct: 0, total: 0 },
      concentration: { correct: 0, total: 0 },
      logic: { correct: 0, total: 0 },
    };

    questions.forEach((q) => {
      const userAnswer = answers[q.question_number];
      const dimension = q.dimension as TestDimension;

      dimensionScores[dimension].total++;

      if (userAnswer === q.correct_answer) {
        correctCount++;
        dimensionScores[dimension].correct++;
      }
    });

    const iqScore = Math.round(100 + (correctCount / questions.length - 0.5) * 100);

    const finalDimensionScores: Record<TestDimension, number> = {
      memory: Math.round((dimensionScores.memory.correct / dimensionScores.memory.total) * 100),
      speed: Math.round((dimensionScores.speed.correct / dimensionScores.speed.total) * 100),
      reaction: Math.round((dimensionScores.reaction.correct / dimensionScores.reaction.total) * 100),
      concentration: Math.round((dimensionScores.concentration.correct / dimensionScores.concentration.total) * 100),
      logic: Math.round((dimensionScores.logic.correct / dimensionScores.logic.total) * 100),
    };

    return { score: correctCount, iqScore, dimensionScores: finalDimensionScores };
  };

  // 支付成功后的核心处理逻辑
  const processPaymentSuccess = async () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const testAnswersStr = localStorage.getItem('testAnswers');
      const timeTakenStr = localStorage.getItem('testTimeTaken');
      const paymentDetailsStr = localStorage.getItem('paymentDetails');

      if (!userInfoStr) {
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '请先完成测试或提供邮箱信息' : 'Please complete the test or provide email information first',
          variant: 'destructive',
        });
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const paymentDetails = paymentDetailsStr ? JSON.parse(paymentDetailsStr) : null;

      toast({
        title: language === 'zh' ? '支付成功' : 'Payment Successful',
        description: language === 'zh' ? '正在处理您的订单...' : 'Processing your order...',
      });

      if (!user) {
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '请先验证您的邮箱' : 'Please verify your email first',
          variant: 'destructive',
        });
        return;
      }

      const userId = user.id;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email || userInfo.email,
            full_name: userInfo.fullName,
            age: userInfo.age,
            gender: userInfo.gender,
            role: 'user',
            has_paid: true,
            subscription_type: type,
            subscription_expires_at:
              type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          })
          .select()
          .single();

        if (profileError) {
          console.error('创建profile失败:', profileError);
          throw new Error('创建账号失败');
        }
      } else {
        await updateProfile(userId, {
          full_name: userInfo.fullName || undefined,
          age: userInfo.age,
          gender: userInfo.gender || undefined,
          has_paid: true,
          subscription_type: type,
          subscription_expires_at:
            type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        });
      }

      if (testAnswersStr && userId) {
        const testAnswers = JSON.parse(testAnswersStr);
        const timeTaken = parseInt(timeTakenStr || '0', 10);

        const questions = await getAllQuestions();
        const { score, iqScore, dimensionScores } = calculateIQScore(testAnswers, questions);

        await saveTestResult({
          user_id: userId,
          answers: testAnswers,
          score,
          iq_score: iqScore,
          dimension_scores: dimensionScores,
          time_taken: timeTaken,
        });

        localStorage.removeItem('testAnswers');
        localStorage.removeItem('testTimeTaken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('currentTestResultId');
      }

      if (userId) {
        const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await createOrder({
          order_no: orderNo,
          user_id: userId,
          status: 'paid',
          subscription_type: type,
          subscription_plan_id: paymentDetails?.planId || selectedPlan?.id || '',
          amount: paymentDetails?.amount || amount,
          paypal_order_id: paymentDetails?.orderId || paymentDetails?.subscriptionId,
        });

        if (paymentDetails) localStorage.removeItem('paymentDetails');
      }

      await refreshProfile();

      setPaymentSuccess(true);
      toast({
        title: language === 'zh' ? '账号创建成功' : 'Account Created Successfully',
        description: language === 'zh' ? '正在跳转到结果页面...' : 'Redirecting to results page...',
      });

      setTimeout(() => {
        navigate('/result');
      }, 2000);
    } catch (error: any) {
      console.error('支付失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '支付失败，请重试' : 'Payment failed, please try again',
        variant: 'destructive',
      });
    }
  };

  // ✅ 关闭 OTP 弹窗时顺便重置状态（避免下次打开还停留在 code 步骤）
  const handleOtpOpenChange = (open: boolean) => {
    setShowOtpForm(open);
    if (!open) {
      setOtpLoading(false);
      setOtpStep('email');
      setOtpCode('');
      // 这里是否清空 email 取决于你想不想保留用户输入
      // setOtpEmail('');
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {language === 'zh' ? '支付成功！' : 'Payment Successful!'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {language === 'zh' ? '正在跳转到仪表盘...' : 'Redirecting to dashboard...'}
              </p>
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBanner = purchaseBanners[currentBannerIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ OTP 模态框（不会替换整个页面） */}
      <Dialog open={showOtpForm} onOpenChange={handleOtpOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'zh' ? '验证您的邮箱' : 'Verify Your Email'}
            </DialogTitle>
            <DialogDescription>
              {language === 'zh'
                ? '输入验证码以继续完成支付'
                : 'Enter the verification code to complete your payment'}
            </DialogDescription>
          </DialogHeader>

          {otpStep === 'email' ? (
            <form onSubmit={handleSendOTPCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email" className="text-gray-700 font-medium">
                  {language === 'zh' ? '邮箱地址' : 'Email Address'}
                </Label>
                <Input
                  id="otp-email"
                  type="email"
                  placeholder="your@email.com"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 h-11" disabled={otpLoading}>
                  {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'zh' ? '发送验证码' : 'Send Code'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleOtpOpenChange(false)}
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTPCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-code" className="text-gray-700 font-medium">
                  {language === 'zh' ? '验证码' : 'Verification Code'}
                </Label>
                <Input
                  id="otp-code"
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-11 text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500">
                  {language === 'zh' ? '验证码已发送至：' : 'Code sent to: '}
                  {otpEmail}
                </p>
              </div>

              <Button type="submit" className="w-full h-11" disabled={otpLoading}>
                {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'zh' ? '验证' : 'Verify'}
              </Button>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setOtpStep('email')}>
                  {language === 'zh' ? '修改邮箱' : 'Change Email'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => handleOtpOpenChange(false)}
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 购买横幅 */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-3 overflow-hidden border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm animate-fade-in">
            <span className="font-semibold text-orange-800">
              {language === 'zh' ? currentBanner.chineseName : currentBanner.name}
            </span>{' '}
            <span className="text-orange-700">
              {language === 'zh' ? '刚刚购买智商报告' : 'just purchased IQ report'}
            </span>{' '}
            <span className="font-bold text-orange-600">
              {language === 'zh' ? `智商分数：${currentBanner.iq}` : `IQ Score: ${currentBanner.iq}`}
            </span>
          </div>
        </div>
      </div>

      {/* Hero区域 */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {language === 'zh' ? '🎉 限时优惠：立省85%' : '🎉 Limited Offer: Save 85%'}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              {language === 'zh' ? (
                <>
                  解锁您的<span className="text-orange-500">完整IQ档案</span>
                </>
              ) : (
                <>
                  Unlock Your <span className="text-orange-500">Complete IQ Profile</span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {language === 'zh'
                ? '立即获取详细的认知评估报告、个性化训练计划和官方证书。加入全球超过100万用户的行列！'
                : 'Get instant access to your detailed cognitive assessment, personalized training plan, and official certificate. Join over 1 million users worldwide!'}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{language === 'zh' ? '即时访问' : 'Instant Access'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{language === 'zh' ? '科学验证' : 'Scientifically Validated'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{language === 'zh' ? '100%安全支付' : '100% Secure Payment'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="bg-gray-50 border border-orange-200 rounded-lg py-3 mb-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-orange-600">
              {language === 'zh' ? '⏰ 特惠倒计时：' : '⏰ Special Offer Ends In: '}
              <span className="font-bold ml-2 text-orange-700">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 左侧 */}
          <Card className="shadow-lg h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'zh' ? '您将解锁的内容' : "What You'll Unlock"}
              </h2>
              <div className="space-y-6 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'zh' ? '完整IQ分数和详细分析' : 'Full IQ Score & Breakdown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'zh'
                        ? '详细分析您在记忆、速度、逻辑等方面的认知优势'
                        : 'Detailed analysis of your cognitive strengths across memory, speed, logic, and more'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'zh' ? '可打印证书' : 'Printable Certificate'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'zh' ? '官方IQ证书，您可以下载、打印和分享' : 'Official IQ certificate you can download, print, and share'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'zh' ? '个性化训练仪表盘' : 'Personalized Training Dashboard'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'zh'
                        ? '访问根据您的档案定制的认知游戏和练习'
                        : 'Access to cognitive games and exercises tailored to your profile'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'zh' ? '未来测试访问权限' : 'Future Test Access'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'zh'
                        ? '进行包括职业、情商和焦虑测试在内的额外评估'
                        : 'Take additional assessments including Career, EQ, and Anxiety tests'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 右侧：支付卡片 */}
          <Card className="shadow-xl border-2 border-orange-200 h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {language === 'zh' ? '获取7天试用' : 'Get 7-Day Trial'}
              </h2>

              <div className="space-y-4 mb-6 flex-1">
                {loadingPlan ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : selectedPlan ? (
                  <>
                    {selectedPlan.description.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{feature}</p>
                      </div>
                    ))}
                    {selectedPlan.trial_price > 0 && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {language === 'zh'
                            ? `开始${selectedPlan.trial_duration}${getTimeUnitLabel(selectedPlan.trial_unit, selectedPlan.trial_duration)}试用仅需$${selectedPlan.trial_price.toFixed(
                                2,
                              )}，试用期后，续订费用为$${selectedPlan.recurring_price.toFixed(2)}/${selectedPlan.recurring_duration}${getTimeUnitLabel(
                                selectedPlan.recurring_unit,
                                selectedPlan.recurring_duration,
                              )}。随时取消。`
                            : `Start ${selectedPlan.trial_duration}-${getTimeUnitLabel(selectedPlan.trial_unit, selectedPlan.trial_duration)} trial for just $${selectedPlan.trial_price.toFixed(
                                2,
                              )}, then $${selectedPlan.recurring_price.toFixed(2)}/${selectedPlan.recurring_duration} ${getTimeUnitLabel(
                                selectedPlan.recurring_unit,
                                selectedPlan.recurring_duration,
                              )}. Cancel anytime.`}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {language === 'zh' ? '获得IQ分数并与名人比较' : 'Get IQ score and compare with celebrities'}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {language === 'zh' ? '了解你的强项，人格和职业倾向' : 'Understand your strengths, personality and career tendencies'}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {language === 'zh' ? '每周训练以提高你的认知能力' : 'Weekly training to improve cognitive abilities'}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {language === 'zh'
                          ? `开始7天试用仅需€${amount.toFixed(2)}，试用期后，续订费用为€${monthlyPrice.toFixed(2)}/月起。随时取消。`
                          : `Start 7-day trial for just €${amount.toFixed(2)}, then €${monthlyPrice.toFixed(2)}/month. Cancel anytime.`}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {language === 'zh' ? '今日特惠：' : "Today's Special:"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg line-through text-gray-400">
                        ${selectedPlan ? (selectedPlan.trial_price * 3.5).toFixed(2) : '6.99'}
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        ${selectedPlan ? selectedPlan.trial_price.toFixed(2) : amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{language === 'zh' ? '限时优惠' : 'Limited time offer'}</span>
                  </div>
                </div>

                <PayPalButtons
                  disabled={loadingPlan}
                  style={{ layout: 'horizontal', tagline: false }}
                  createSubscription={async (data, actions) => {
                    try {
                      return actions.subscription.create({
                        plan_id: selectedPlan?.paypal_plan_id || '',
                        custom_id: `TEMP-${Date.now()}`,
                      });
                    } catch (error) {
                      console.error('Error creating subscription:', error);
                      return Promise.reject(error);
                    }
                  }}
                  onApprove={async (data, actions) => {
                    setProcessing(true);
                    try {
                      localStorage.setItem(
                        'paymentDetails',
                        JSON.stringify({
                          subscriptionId: data.subscriptionID,
                          orderId: data.orderID || data.subscriptionID,
                          planId: selectedPlan?.id,
                          amount: selectedPlan?.trial_price,
                        }),
                      );

                      if (user) {
                        await processPaymentSuccess();
                      } else {
                        const userInfoStr = localStorage.getItem('userInfo');
                        if (userInfoStr) {
                          const userInfo = JSON.parse(userInfoStr);
                          setOtpEmail(userInfo.email);
                        }
                        // ✅ 打开模态框，不再整页跳转
                        setShowOtpForm(true);
                      }
                    } catch (error) {
                      console.error('Payment processing failed:', error);
                      toast({
                        title: language === 'zh' ? '错误' : 'Error',
                        description: language === 'zh' ? '支付处理失败，请重试' : 'Payment processing failed, please try again',
                        variant: 'destructive',
                      });
                    } finally {
                      setProcessing(false);
                    }
                  }}
                />

                <p className="text-xs text-center text-gray-500">
                  {language === 'zh' ? '安全支付，支持所有主流信用卡' : 'Secure payment, all major credit cards accepted'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 用户真实反馈 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'zh' ? '用户的真实反馈' : 'Real User Feedback'}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: language === 'zh' ? '张明，32岁' : 'Anna Müller, 32',
                feedback:
                  language === 'zh'
                    ? '参加测试让我对自己有了全新的认识！报告非常详细，让我了解到自己的优势和需要改进的地方。强烈推荐！'
                    : 'Taking the test gave me a whole new understanding of myself! The report was very detailed and helped me understand my strengths and areas for improvement. Highly recommended!',
              },
              {
                name: language === 'zh' ? '李华，54岁' : 'Lukas Schmidt, 54',
                feedback:
                  language === 'zh'
                    ? '令人惊讶的准确！这个IQ测试帮助我在职业发展上做出了更明智的决策，这些自我认知对我的职业生涯产生了积极影响。'
                    : 'Surprisingly accurate! This IQ test helped me make smarter career decisions, and this self-awareness has had a positive impact on my career.',
              },
              {
                name: language === 'zh' ? '王芳，24岁' : 'Leon Fischer, 24',
                feedback:
                  language === 'zh'
                    ? '我对自己的智商一直很好奇，但从未找到一个可信的测试。这个平台提供了专业的评估，而且价格合理。物超所值！'
                    : "I've always been curious about my IQ but never found a reliable test. This platform provided a professional assessment at a reasonable price. Great value!",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-500">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.feedback}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">
            {language === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: language === 'zh' ? '我的IQ测试结果什么时候可以看到？' : 'When can I see my IQ test results?',
                a: language === 'zh'
                  ? '完成支付后，您将立即获得完整的IQ测试报告，包括详细的分析和建议。'
                  : 'After completing payment, you will immediately receive your complete IQ test report with detailed analysis and recommendations.',
              },
              {
                q: language === 'zh' ? '我可以在多个设备上访问我的测试结果吗？' : 'Can I access my test results on multiple devices?',
                a: language === 'zh'
                  ? '是的，您可以使用同一账号在任何设备上登录并查看您的测试结果。'
                  : 'Yes, you can log in with the same account on any device to view your test results.',
              },
              {
                q: language === 'zh' ? '如果我对测试结果不满意怎么办？' : "What if I'm not satisfied with my test results?",
                a: language === 'zh'
                  ? '我们提供7天无理由退款保证。如果您对结果不满意，可以随时申请退款。'
                  : "We offer a 7-day money-back guarantee. If you're not satisfied with the results, you can request a refund at any time.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}