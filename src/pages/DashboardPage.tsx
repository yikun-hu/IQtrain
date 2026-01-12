import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { language } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('training');
  const [loading, setLoading] = useState(true);

  // Training相关状态
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [gamesByCategory, setGamesByCategory] = useState<Record<string, Game[]>>({});

  // Test相关状态
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<any[]>([]);

  // 游戏弹窗相关状态
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [currentGameUrl, setCurrentGameUrl] = useState('');
  const [currentGameTitle, setCurrentGameTitle] = useState('');

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
    const names: Record<string, { en: string; zh: string }> = {
      puzzles: { en: 'Puzzles', zh: '益智游戏' },
      number_games: { en: 'Number Games', zh: '数字游戏' },
      memory_games: { en: 'Memory Games', zh: '记忆游戏' },
      logic_games: { en: 'Logic Games', zh: '逻辑游戏' },
    };
    return language === 'zh' ? names[category]?.zh : names[category]?.en;
  };

  const handlePlayGame = (game: Game) => {
    // 检查用户是否有有效订阅
    if (!hasValidSubscription) {
      openSubscriptionModal();
      return;
    }

    // 确保路径以斜杠开头，这样React会从public目录正确加载
    const gameUrl = game.url.startsWith('/') ? game.url : `/${game.url}`;
    setCurrentGameUrl(gameUrl);
    setCurrentGameTitle(language === 'zh' ? game.title_zh : game.title);
    setIsGameDialogOpen(true);
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
                {language === 'zh' ? '今日训练推荐' : 'Today\'s Train Recommend'}
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
                        onClick={() => handlePlayGame(game)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {language === 'zh' ? '开始游戏' : 'Play Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 所有游戏按类别分类 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {language === 'zh' ? '所有游戏' : 'All Games'}
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
                            onClick={() => handlePlayGame(game)}
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            {language === 'zh' ? '玩' : 'Play'}
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
                {language === 'zh' ? '可用测试' : 'Available Tests'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* 情绪识别能力测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '情绪识别能力测试' : 'Emotional Recognition Test'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您识别和理解他人情绪的能力，包括面部表情、语调和肢体语言的解读能力。'
                        : 'Assess your ability to recognize and understand others\' emotions, including facial expressions, tone, and body language.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/emotional_recognition')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>

                {/* 压力指数自检 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '压力指数自检' : 'Stress Index Self-Assessment'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您当前的压力水平，了解压力来源和应对能力，获得个性化的压力管理建议。'
                        : 'Assess your current stress level, understand stress sources and coping abilities, and receive personalized stress management advice.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/stress_index')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>

                {/* 心理韧性测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '心理韧性测试' : 'Psychological Resilience Test'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您在面对压力和挑战时的恢复能力，包括情绪管理、心理调节和恢复能力。'
                        : 'Assess your ability to recover from stress and challenges, including emotional management, psychological regulation, and recovery abilities.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/psychological_resilience')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>


                {/* 生活满意度量表 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '生活满意度量表' : 'Life Satisfaction Scale'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您的生活满意度，包括工作、生活、情感和社会关系等方面。'
                        : 'Assess your life satisfaction, including work, life, emotions, and social relationships.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/life_satisfaction')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>


                {/* 领导力潜力测评 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '领导力潜力测评' : 'Leadership Potential Test'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您的领导力潜力，包括团队合作、决策能力和解决问题的能力。'
                        : 'Assess your leadership potential, including team collaboration, decision-making abilities, and problem-solving skills.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/leadership_potential')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>

                {/* 多元智能测试 */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {language === 'zh' ? '多元智能测试' : 'Multiple Intelligences Test'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'zh'
                        ? '评估您的多个智能能力，包括视觉、听觉、运动和语言能力。'
                        : 'Assess your multiple intelligences, including visual, auditory, motor, and language abilities.'}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <span>⏱️ 5-10 {language === 'zh' ? '分钟' : 'min'}</span>
                      <span>📝 10 {language === 'zh' ? '题' : 'questions'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                        className="w-full"
                        onClick={() => handleStartTest('/scale-test/multiple_intelligences')}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                  </CardContent>
                </Card>

              </div>
            </section>

            {/* 可用测试 */}
            {/* <section>
              <h2 className="text-2xl font-bold mb-4">
                {language === 'zh' ? '更多测试' : 'Available Tests'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableTests.map((test) => (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{language === 'zh' ? test.title_zh : test.title}</CardTitle>
                      <CardDescription>
                        {language === 'zh' ? test.description_zh : test.description}
                      </CardDescription>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        {test.duration && (
                          <span>⏱️ {test.duration} {language === 'zh' ? '分钟' : 'min'}</span>
                        )}
                        {test.question_count && (
                          <span>📝 {test.question_count} {language === 'zh' ? '题' : 'questions'}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/test/${test.id}`)}
                      >
                        {language === 'zh' ? '开始测试' : 'Start Test'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section> */}

            {/* 已完成测试 */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {language === 'zh' ? '已完成测试' : 'Completed Tests'}
              </h2>
              {completedTests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {language === 'zh' ? '暂无已完成的测试' : 'No completed tests yet'}
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
                        return language === 'zh' ? '情绪识别能力测试' : 'Emotional Recognition Test';
                      } else if (result.test_type === 'stress_index') {
                        return language === 'zh' ? '压力指数自检' : 'Stress Index Self-Assessment';
                      } else if (result.test_type === 'psychological_resilience') {
                        return language === 'zh' ? '心理韧性测试' : 'Psychological Resilience Test';
                      } else if (result.test_type === 'multiple_intelligences') {
                        return language === 'zh' ? '多元智能测试' : 'Multiple Intelligences Test';
                      } else if (result.test_type === 'leadership_potential') {
                        return language === 'zh' ? '领导力潜力测评' : 'Leadership Potential Assessment';
                      } else if (result.test_type === 'life_satisfaction') {
                        return language === 'zh' ? '生活满意度量表' : 'Life Satisfaction Scale';
                      } else {
                        return language === 'zh' ? 'IQ测试' : 'IQ Test';
                      }
                    };

                    // 获取测试类型标签
                    const getTestTypeLabel = () => {
                      if (result.test_type === 'emotional_recognition') {
                        return language === 'zh' ? '心理量表' : 'Psychological Scale';
                      } else if (result.test_type === 'stress_index') {
                        return language === 'zh' ? '心理量表' : 'Psychological Scale';
                      } else {
                        return language === 'zh' ? '智力测试' : 'Intelligence Test';
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
                            {language === 'zh' ? '完成时间：' : 'Completed: '}
                            {new Date(result.completed_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary">{getScoreDisplay()}</p>
                              <p className="text-sm text-muted-foreground">
                                {language === 'zh' ? '分数' : 'Score'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => handleViewReport(getResultPath())}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {language === 'zh' ? '查看结果' : 'View Results'}
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

      {/* 游戏弹窗 - 完整覆盖当前页面 */}
      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent
          className="w-full h-full max-w-none max-h-none p-0 overflow-hidden fixed inset-0 top-0 left-0 right-0 bottom-0 translate-x-0 translate-y-0 rounded-none"
        >
          <DialogHeader
            className="p-4 border-b bg-background/90 backdrop-blur-sm z-10 absolute top-0 left-0 right-0">
            <DialogTitle>{currentGameTitle}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full pt-16">
            <iframe
              src={currentGameUrl}
              title={currentGameTitle}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 订阅提示模态框 */}
      <AlertDialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'zh' ? '需要订阅才能继续' : 'Subscription Required'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'zh'
                ? '您需要先订阅才能开始游戏或测试。订阅后您将获得完整的功能访问权限。'
                : 'You need to subscribe first to start games or tests. With a subscription, you will get full access to all features.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeSubscriptionModal}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={goToPricingPage} className="bg-primary">
              {language === 'zh' ? '前往订阅' : 'Go to Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}