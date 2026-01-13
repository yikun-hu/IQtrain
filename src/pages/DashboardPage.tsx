import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllGames, getRandomGames, getAllTests, getTestResults } from '@/db/api';
import type { Game, Test } from '@/types/types';
import { Loader2, ExternalLink, Play, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('training');
  const [loading, setLoading] = useState(true);

  // 检查URL参数并设置初始标签页
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'training' || tabParam === 'tests')) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Training相关状态
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [gamesByCategory, setGamesByCategory] = useState<Record<string, Game[]>>({});

  // Test相关状态
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<any[]>([]);

  // 订阅提示模态框状态
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // 检查用户是否有有效订阅
  const hasValidSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;

  // 打开订阅提示模态框
  const openSubscriptionModal = () => {
    setIsSubscriptionModalOpen(true);
  };

  // 关闭订阅提示模态框
  const closeSubscriptionModal = () => {
    setIsSubscriptionModalOpen(false);
  };

  // 跳转到订阅页面
  const goToPricingPage = () => {
    closeSubscriptionModal();
    navigate('/pricing');
  };

  // 处理测试开始按钮点击事件
  const handleStartTest = (testPath: string) => {
    // 检查用户是否有有效订阅
    if (!hasValidSubscription) {
      openSubscriptionModal();
      return;
    }

    // 跳转到测试页面
    navigate(testPath);
  };

  // 处理查看报告按钮点击事件
  const handleViewReport = (reportPath: string) => {
    // 检查用户是否有有效订阅
    if (!hasValidSubscription) {
      openSubscriptionModal();
      return;
    }

    // 跳转到报告页面
    navigate(reportPath);
  };

  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) return;

    loadData();
  }, [user, authLoading]);

  // 监听来自Header的tab切换事件
  useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('dashboard-tab-change', handleTabChange);

    return () => {
      window.removeEventListener('dashboard-tab-change', handleTabChange);
    };
  }, []);

  const loadData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 加载游戏数据
      const [recommended, games, tests, testResults] = await Promise.all([
        getRandomGames(3),
        getAllGames(),
        getAllTests(),
        getTestResults(user.id),
      ]);

      setRecommendedGames(recommended);
      setAllGames(games);

      // 按类别分组游戏
      const grouped = games.reduce((acc, game) => {
        if (!acc[game.category]) {
          acc[game.category] = [];
        }
        acc[game.category].push(game);
        return acc;
      }, {} as Record<string, Game[]>);
      setGamesByCategory(grouped);

      setAvailableTests(tests);
      setCompletedTests(testResults);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: string) => {
    return t.dashboard.gameCategories[category as keyof typeof t.dashboard.gameCategories] || category;
  };


  // 如果认证状态或数据正在加载，显示加载界面
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* 隐藏TabsList，使用header中的导航 */}
          <TabsList className="hidden"></TabsList>

          {/* Training标签页 */}
          <TabsContent value="training" className="space-y-8">
            {/* Today's Train Recommend */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t.dashboard.todayTrainRecommend}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedGames.map((game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {game.thumbnail_url && (
                        <img
                          src={game.thumbnail_url}
                          alt={language === 'zh' ? game.title_zh : game.title}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      )}
                      <CardTitle>{language === 'zh' ? game.title_zh : game.title}</CardTitle>
                      <CardDescription>
                        {language === 'zh' ? game.description_zh : game.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => window.open(game.url, '_blank')}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {t.dashboard.playNow}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 所有游戏按类别分类 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t.dashboard.allGames}
              </h2>
              {Object.entries(gamesByCategory).map(([category, games]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">{getCategoryName(category)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {games.map((game) => (
                      <Card key={game.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          {game.thumbnail_url && (
                            <img
                              src={game.thumbnail_url}
                              alt={language === 'zh' ? game.title_zh : game.title}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          )}
                          <CardTitle className="text-base">
                            {language === 'zh' ? game.title_zh : game.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(game.url, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            {t.dashboard.play}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </TabsContent>

          {/* Tests标签页 */}
          <TabsContent value="tests" className="space-y-8">
            {/* 量表测试 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t.dashboard.availableTests}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* 情绪识别能力测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.emotionalRecognitionTest}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.emotionalRecognitionDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/emotional_recognition')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>

                {/* 压力指数自检 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.stressIndexSelfAssessment}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.stressIndexDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/stress_index')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>

                {/* 心理韧性测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.psychologicalResilienceTest}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.psychologicalResilienceDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/psychological_resilience')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>


                {/* 生活满意度量表 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.lifeSatisfactionScale}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.lifeSatisfactionDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/life_satisfaction')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>


                {/* 领导力潜力测评 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.leadershipPotentialTest}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.leadershipPotentialDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/leadership_potential')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>

                {/* 多元智能测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {t.dashboard.multipleIntelligencesTest}
                    </CardTitle>
                    <CardDescription>
                      {t.dashboard.multipleIntelligencesDesc}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {t.dashboard.minutes}</span>
                      <span>📝 20 {t.dashboard.questions}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest('/scale-test/multiple_intelligences')}
                    >
                      {t.dashboard.startTest}
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* 已完成测试 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t.dashboard.completedTests}
              </h2>
              {completedTests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {t.dashboard.noCompletedTests}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTests.map((result: any) => {
                    // 判断测试类型
                    const isScaleTest = result.test_type && (result.test_type === 'emotional_recognition' || result.test_type === 'stress_index');

                    // 获取测试名称
                    const getTestName = () => {
                      if (result.test_type === 'emotional_recognition') {
                        return t.dashboard.emotionalRecognitionTest;
                      } else if (result.test_type === 'stress_index') {
                        return t.dashboard.stressIndexSelfAssessment;
                      } else if (result.test_type === 'psychological_resilience') {
                        return t.dashboard.psychologicalResilienceTest;
                      } else if (result.test_type === 'multiple_intelligences') {
                        return t.dashboard.multipleIntelligencesTest;
                      } else if (result.test_type === 'leadership_potential') {
                        return t.dashboard.leadershipPotentialTest;
                      } else if (result.test_type === 'life_satisfaction') {
                        return t.dashboard.lifeSatisfactionScale;
                      } else {
                        return t.dashboard.iqTest;
                      }
                    };

                    // 获取测试类型标签
                    const getTestTypeLabel = () => {
                      if (result.test_type === 'emotional_recognition' || result.test_type === 'stress_index' || result.test_type === 'psychological_resilience' || result.test_type === 'life_satisfaction' || result.test_type === 'leadership_potential') {
                        return t.dashboard.psychologicalScale;
                      } else {
                        return t.dashboard.intelligenceTest;
                      }
                    };

                    // 获取分数显示
                    const getScoreDisplay = () => {
                      if (isScaleTest) {
                        return result.iq_score || result.score || 0;
                      } else {
                        return result.iq_score || 0;
                      }
                    };

                    // 获取查看结果的路径
                    const getResultPath = () => {
                      if (isScaleTest) {
                        return `/scale-test-report/${result.id}`;
                      } else {
                        return `/result`;
                      }
                    };

                    return (
                      <Card key={result.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {getTestName()}
                            </CardTitle>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {getTestTypeLabel()}
                            </span>
                          </div>
                          <CardDescription>
                            {t.dashboard.completed}
                            {new Date(result.completed_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary">{getScoreDisplay()}</p>
                              <p className="text-sm text-muted-foreground">
                                {t.dashboard.score}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleViewReport(getResultPath())}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t.dashboard.viewResults}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* 订阅提示模态框 */}
      <AlertDialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.dashboard.subscriptionRequired}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.dashboard.subscriptionPrompt}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeSubscriptionModal}>
              {t.dashboard.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={goToPricingPage} className="bg-primary">
              {t.dashboard.goToSubscription}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}