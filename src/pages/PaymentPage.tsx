import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  createVerifiedOrder,
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
const generatePurchaseBanners = (t: any) => {
  return t?.payment?.purchaseBanner?.names?.map((name: string) => ({
    name,
    iq: Math.floor(Math.random() * (145 - 95) + 95),
  }));
};

export default function PaymentPage() {
  const { language, t } = useLanguage();
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(6 * 60 + 26); // 6:26
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [purchaseBanners] = useState(() => generatePurchaseBanners(t));
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // OTP verification state
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  // Payment processing state
  const [showPaymentProcessingModal, setShowPaymentProcessingModal] = useState(false);

  // 从URL获取plan_id，如果没有则使用旧的type参数
  const planId = searchParams.get('plan_id');
  const type = (searchParams.get('type') as SubscriptionType) || 'biweekly';
  const amount = type === 'biweekly' ? 1.98 : 28.8;
  const monthlyPrice = 28.8;

  // 加载订阅包和支付网关配置
  useEffect(() => {
    const loadPlanAndConfig = async () => {
      try {
        setLoadingPlan(true);

        const [planData] = await Promise.all([
          planId ? getSubscriptionPlan(planId) : getSubscriptionPlan('dc1188f6-7d2a-40f9-97f6-648a975fe82c'),
        ]);

        if (planData) setSelectedPlan(planData);
      } catch (error) {
        console.error('加载订阅包或支付网关配置失败:', error);
        toast({
          title: t.common.error,
          description: t.payment.errors.loadSubscription,
          variant: 'destructive',
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlanAndConfig();
  }, [planId, language, toast]);

  // 获取时间单位标签
  const getTimeUnitLabel = (unit: keyof typeof t.pricing.timeUnits, duration: number) => {
    return duration > 1 ? t.pricing.timeUnits[unit].plural : t.pricing.timeUnits[unit].singular;
  };

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 页面加载时检查用户状态：未登录且未答题则跳转到首页
  useEffect(() => {
    // 检查用户是否已登录
    const isLoggedIn = !!user;
    // 检查是否有用户答题信息
    const hasUserInfo = localStorage.getItem('userInfo');

    // 如果用户未登录且未答题，直接跳转到首页
    if (!isLoggedIn && !hasUserInfo) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

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
        title: t.common.error,
        description: t.payment.errors.noValidEmail,
        variant: 'destructive',
      });
      return;
    }

    setOtpLoading(true);
    try {
      await signInWithOTP(otpEmail);
      setOtpStep('code');
      toast({
        title: t.common.success,
        description: t.common.verificationCodeSent,
      });
    } catch (error: any) {
      toast({
        title: t.common.error,
        description: error.message || t.payment.errors.sendOTP,
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
        title: t.common.error,
        description: t.payment.errors.invalidOTP,
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
        title: t.common.error,
        description: t.payment.errors.otpError,
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

      if (!user) {
        toast({
          title: t.common.error,
          description: t.payment.errors.emailVerify,
          variant: 'destructive',
        });
        return;
      }

      let userInfo = null;
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr);
      }
      const paymentDetails = paymentDetailsStr ? JSON.parse(paymentDetailsStr) : null;

      // 显示支付处理模态框
      setShowPaymentProcessingModal(true);

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
            email: user.email || (userInfo?.email || ''),
            full_name: userInfo?.fullName,
            age: userInfo?.age,
            gender: userInfo?.gender,
            // role: 'user',
            // has_paid: true,
            // subscription_type: type,
            // subscription_expires_at:
            //   type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          })
          .select()
          .single();

        if (profileError) {
          console.error('创建profile失败:', profileError);
          throw new Error('创建账号失败');
        }
      } else if (userInfo) {
        await updateProfile(userId, {
          full_name: userInfo.fullName || undefined,
          age: userInfo.age,
          gender: userInfo.gender || undefined,
          // has_paid: true,
          // subscription_type: type,
          // subscription_expires_at:
          //   type === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
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
          test_type: 'iq',
          iq_score: iqScore,
          dimension_scores: dimensionScores,
          time_taken: timeTaken,
        });

        // localStorage.removeItem('testAnswers');
        // localStorage.removeItem('testTimeTaken');
        // localStorage.removeItem('userInfo');
        // localStorage.removeItem('currentTestResultId');
      }

      if (userId) {
        const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(paymentDetails);
        const orderData = {
          // order_no: orderNo,
          user_id: userId,
          // status: 'paid',
          // subscription_type: type,
          subscription_plan_id: paymentDetails?.planId || selectedPlan?.id || '',
          // amount: paymentDetails?.amount || amount,
          paypal_order_id: paymentDetails?.subscriptionId,
        };
        await createVerifiedOrder(userId, orderData.paypal_order_id, orderData.subscription_plan_id);

        // if (paymentDetails) localStorage.removeItem('paymentDetails');
      }

      await refreshProfile();

      setPaymentSuccess(true);

      setTimeout(() => {
        // 根据是否有用户答题信息决定跳转目标
        if (userInfoStr) {
          // 用户已答题，跳转到结果页面
          navigate('/result');
        } else {
          // 用户未答题，跳转到仪表盘
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      console.error('支付失败:', error);
      // 关闭处理模态框
      setShowPaymentProcessingModal(false);
      toast({
        title: t.common.error,
        description: t.payment.errors.paymentProcess,
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
                {t.payment.paymentSuccess.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t.payment.paymentSuccess.redirecting}
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
              {t.payment.otp.verifyEmail}
            </DialogTitle>
            <DialogDescription>
              {t.payment.otp.enterCode}
            </DialogDescription>
          </DialogHeader>

          {otpStep === 'email' ? (
            <form onSubmit={handleSendOTPCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email" className="text-gray-700 font-medium">
                  {t.payment.otp.emailAddress}
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
                  {t.payment.otp.sendCode}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => handleOtpOpenChange(false)}
                >
                  {t.payment.otp.cancel}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTPCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-code" className="text-gray-700 font-medium">
                  {t.payment.otp.verificationCode}
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
                  {t.payment.otp.codeSent}
                  {otpEmail}
                </p>
              </div>

              <Button type="submit" className="w-full h-11" disabled={otpLoading}>
                {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.payment.otp.verify}
              </Button>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setOtpStep('email')}>
                  {t.payment.otp.changeEmail}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => handleOtpOpenChange(false)}
                >
                  {t.payment.otp.cancel}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 支付处理模态框 */}
      <Dialog open={showPaymentProcessingModal} onOpenChange={() => { }} aria-describedby="payment-processing-description">
        <DialogContent className="sm:max-w-md z-[500]">
          <DialogHeader>
            <DialogTitle>
              {t.payment.success}
            </DialogTitle>
            <DialogDescription id="payment-processing-description">
              {t.payment.paymentSuccess.orderProcessing}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              {t.payment.paymentSuccess.preparingResults}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 购买横幅 */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-3 overflow-hidden border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm animate-fade-in">
            <span className="font-semibold text-orange-800">
              {currentBanner.name}
            </span>{' '}
            <span className="text-orange-700">
              {t.payment.purchaseBanner.justPurchased}
            </span>{' '}
            <span className="font-bold text-orange-600">
              {t.payment.purchaseBanner.iqScore}
              {currentBanner.iq}
            </span>
          </div>
        </div>
      </div>

      {/* Hero区域 */}
      <div className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              {t.payment.hero.limitedOffer}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              {t.payment.hero.unlockProfile}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.payment.hero.description}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{t.payment.hero.instantAccess}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{t.payment.hero.scientificallyValidated}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-700">{t.payment.hero.securePayment}</span>
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
              {t.payment.countdown.specialOfferEnds}
              <span className="font-bold ml-2 text-orange-700">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 左侧 */}
          <Card className="shadow-lg h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-6">
                {t.payment.unlock.title}
              </h2>
              <div className="space-y-6 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t.payment.unlock.fullIQScore}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t.payment.unlock.fullIQDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t.payment.unlock.printableCertificate}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t.payment.unlock.certificateDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t.payment.unlock.trainingDashboard}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t.payment.unlock.dashboardDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t.payment.unlock.futureTestAccess}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t.payment.unlock.testAccessDescription}
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
                {t.payment.paymentCard.getTrial}
              </h2>

              <div className="space-y-4 mb-6 flex-1">
                {loadingPlan ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : selectedPlan ? (
                  <>
                    {selectedPlan.description[language].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{feature}</p>
                      </div>
                    ))}
                    {selectedPlan.trial_price > 0 && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          {t.payment.paymentCard.planTrialDescription
                            .replace('{trialDuration}', String(selectedPlan.trial_duration))
                            .replace('{trialUnit}', getTimeUnitLabel(selectedPlan.trial_unit, selectedPlan.trial_duration))
                            .replace('${trialPrice}', selectedPlan.trial_price.toFixed(2))
                            .replace('${recurringPrice}', selectedPlan.recurring_price.toFixed(2))
                            .replace('{recurringDuration}', String(selectedPlan.recurring_duration))
                            .replace('{recurringUnit}', getTimeUnitLabel(
                              selectedPlan.recurring_unit,
                              selectedPlan.recurring_duration,
                            ))}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {t.payment.paymentCard.getIQScore}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {t.payment.paymentCard.understandStrengths}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {t.payment.paymentCard.weeklyTraining}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <p className="text-sm text-gray-700">
                          {t.payment.paymentCard.startTrialWithPrice
                            .replace('${amount}', amount.toFixed(2))
                            .replace('${monthlyPrice}', monthlyPrice.toFixed(2))}
                        </p>
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {t.payment.paymentCard.todaySpecial}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg line-through text-gray-400">
                        ${selectedPlan ? (selectedPlan.trial_price * 10).toFixed(2) : '19.80'}
                      </span>
                      <span className="text-3xl font-bold text-primary">
                        ${selectedPlan ? selectedPlan.trial_price.toFixed(2) : amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{t.payment.countdown.limitedTimeOffer}</span>
                  </div>
                </div>

                <div className={showOtpForm ? 'opacity-50 pointer-events-none' : ''}>
                  <PayPalButtons
                    disabled={loadingPlan || showOtpForm}
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
                          title: t.common.error,
                          description: t.payment.errors.paymentProcess,
                          variant: 'destructive',
                        });
                      } finally {
                        setProcessing(false);
                      }
                    }}
                  />
                </div>

                <p className="text-xs text-center text-gray-500">
                  {t.payment.paymentCard.securePayment}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 用户真实反馈 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t.payment.testimonials.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {t.payment.testimonials.users.map((testimonial, index) => (
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
            {t.payment.faq.title}
          </h2>
          <div className="space-y-4">
            {t.payment.faq.questions.map((faq, index) => (
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