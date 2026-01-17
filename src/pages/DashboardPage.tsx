import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ITranslatedField } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllGames, getTestResults } from '@/db/api';
import type { Game } from '@/types/types';
import { Loader2, FileText, Star, StarHalf, Play } from 'lucide-react';

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
  const [gamesByCategory, setGamesByCategory] = useState<Record<string, Game[]>>({});
  const [allGamesList, setAllGamesList] = useState<Game[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Test相关状态
  const [completedTests, setCompletedTests] = useState<any[]>([]);

  // 订阅提示模态框状态
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // 检查用户是否有有效订阅
  const hasValidSubscription = profile?.has_paid &&
    (!profile?.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

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

  const handleStartGame = (game: Game) => {
    // 检查用户是否有有效订阅
    if (!hasValidSubscription) {
      openSubscriptionModal();
      return;
    }

    window.open(game.url);
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

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
      // 加载游戏数据 - 优化：只调用一次 getAllGames，然后在客户端随机选择推荐游戏
      const [games, testResults] = await Promise.all([
        getAllGames(),
        getTestResults(user.id),
      ]);

      // 从所有游戏中随机选择3个作为推荐游戏
      const shuffled = [...games].sort(() => Math.random() - 0.5);
      const recommended = shuffled.slice(0, 3);

      // 游戏数据已经在 API 层规范化，这里直接使用
      // 如果 API 返回的数据还需要进一步处理，可以在这里添加
      const normalizedRecommended = recommended;
      const normalizedGames = games;

      setRecommendedGames(normalizedRecommended);
      setAllGamesList(normalizedGames);

      // 按类别分组游戏
      const grouped = normalizedGames.reduce((acc, game) => {
        if (!acc[game.category]) {
          acc[game.category] = [];
        }
        acc[game.category].push(game);
        return acc;
      }, {} as Record<string, Game[]>);
      setGamesByCategory(grouped);

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

  // 获取翻译字段的值（从 ITranslatedField 对象中根据当前语言获取）
  const getTranslatedValue = (field: ITranslatedField | undefined, fallback: string = ''): string => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    // 如果是对象，优先使用当前语言，然后回退到 en-US，最后是 zh-CN
    if (typeof field === 'object' && field !== null) {
      const value = field[language] || field['en-US'] || field['zh-CN'] || fallback;
      return typeof value === 'string' ? value : String(value || fallback);
    }
    return fallback;
  };

  // 渲染评分星星
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => {
          const i = idx + 1;
          if (i <= full) {
            return (
              <div key={i} className="relative">
                <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 absolute inset-0" />
              </div>
            );
          }
          if (hasHalf && i === full + 1) {
            return (
              <div key={i} className="relative">
                <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                <StarHalf className="h-4 w-4 fill-yellow-500 text-yellow-500 absolute inset-0" />
              </div>
            );
          }
          return <Star key={i} className="h-4 w-4 fill-gray-300 text-gray-300" />;
        })}
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-background via-gray-50/50 to-background">
      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* 隐藏TabsList，使用header中的导航 */}
          <TabsList className="hidden"></TabsList>

          {/* Training标签页 */}
          <TabsContent value="training" className="space-y-10">
            {/* Today's Train Recommend */}
            <section>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t.dashboard.todayTrainRecommend}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedGames.map((game) => {
                  const gameTitle = getTranslatedValue(game.title);
                  const gameDescription = getTranslatedValue(game.description);
                  const whoShouldPlay = getTranslatedValue(game.who_should_play);
                  const categoryName = getCategoryName(game.category);

                  return (
                    <Card
                      key={game.id}
                      className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden border-2 border-border/50 hover:border-primary/30 flex flex-col bg-card/50 backdrop-blur-sm
            /* 核心新增：限制卡片外部高度 */
            max-h-[260px] /* 可根据需要调整这个数值，比如 250px/300px */
            h-fit /* 让卡片高度自适应内容，但不超过max-h */"
                    >
                      <div className="flex flex-row items-stretch">
                        {game.thumbnail_url && (
                          <div className="relative w-32 sm:w-36 md:w-40 aspect-square flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center m-4 mt-0 mr-0">
                          <img
                            src={game.thumbnail_url}
                            alt={gameTitle}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <CardContent className="px-4 pt-0 pb-4 pr-4 flex flex-col gap-1.5 flex-1 min-w-0 justify-between">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1 font-semibold flex-1">
                                {gameTitle}
                              </CardTitle>
                              {categoryName && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white whitespace-nowrap flex-shrink-0">
                                  {categoryName}
                                </span>
                              )}
                            </div>
                            {game.rating !== undefined && (
                              <div className="flex items-center gap-2">
                                {renderStars(game.rating)}
                                <span className="text-sm font-medium text-foreground">
                                  {game.rating.toFixed(1)}
                                  {game.rating_count !== undefined && game.rating_count > 0 && (
                                    <span className="text-muted-foreground ml-1">
                                      ({game.rating_count.toLocaleString()})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <CardDescription className="text-xs line-clamp-3 text-muted-foreground leading-snug">
                              {gameDescription}
                            </CardDescription>
                          </div>
                          <button
                            className="w-full h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 cursor-pointer"
                            onClick={() => handleStartGame(game)}
                          >
                            <span>{t.dashboard.playNow}</span>
                            <Play className="h-4 w-4 fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] filter blur-[0.5px]" />
                          </button>
                        </CardContent>
                      </div>
                      {whoShouldPlay && (
                        <div className="px-4 pb-2 pt-1.5 border-t border-border/50 relative top-[-25px]">
                          <div className="text-xs text-muted-foreground leading-normal">
                            <span className="font-semibold text-foreground/80">{t.dashboard.whoShouldPlay}</span>
                            <span className="ml-1.5">{whoShouldPlay}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* 所有游戏按类别分类 */}
            <section>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t.dashboard.games}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
              </div>

              {/* 分类筛选按钮 */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {t.dashboard.allGames}
                </button>
                {Object.keys(gamesByCategory).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {getCategoryName(category)}
                  </button>
                ))}
              </div>

              {/* 游戏卡片网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedCategory === 'all'
                  ? allGamesList
                  : gamesByCategory[selectedCategory] || []
                ).map((game) => {
                  const gameTitle = getTranslatedValue(game.title);
                  const gameDescription = getTranslatedValue(game.description);
                  const whoShouldPlay = getTranslatedValue(game.who_should_play);
                  const categoryName = getCategoryName(game.category);

                  return (
                    <Card
                      key={game.id}
                      className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden border-2 border-border/50 hover:border-primary/30 flex flex-col bg-card/50 backdrop-blur-sm
            /* 核心新增：限制卡片外部高度 */
            max-h-[260px] /* 可根据需要调整这个数值，比如 250px/300px */
            h-fit /* 让卡片高度自适应内容，但不超过max-h */"
                    >
                      <div className="flex flex-row items-stretch">
                        {game.thumbnail_url && (
                          <div className="relative w-32 sm:w-36 md:w-40 aspect-square flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center m-4 mt-0 mr-0">
                            <img
                              src={game.thumbnail_url}
                              alt={gameTitle}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <CardContent className="px-4 pt-0 pb-4 pr-4 flex flex-col gap-1.5 flex-1 min-w-0 justify-between">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1 font-semibold flex-1">
                                {gameTitle}
                              </CardTitle>
                              {categoryName && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white whitespace-nowrap flex-shrink-0">
                                  {categoryName}
                                </span>
                              )}
                            </div>
                            {game.rating !== undefined && (
                              <div className="flex items-center gap-2">
                                {renderStars(game.rating)}
                                <span className="text-sm font-medium text-foreground">
                                  {game.rating.toFixed(1)}
                                  {game.rating_count !== undefined && game.rating_count > 0 && (
                                    <span className="text-muted-foreground ml-1">
                                      ({game.rating_count.toLocaleString()})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <CardDescription className="text-xs line-clamp-3 text-muted-foreground leading-snug">
                              {gameDescription}
                            </CardDescription>
                          </div>
                          <button
                            className="w-full h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 cursor-pointer"
                            onClick={() => window.open(game.url, '_blank')}
                          >
                            <span>{t.dashboard.playNow}</span>
                            <Play className="h-4 w-4 fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] filter blur-[0.5px]" />
                          </button>
                        </CardContent>
                      </div>
                      {whoShouldPlay && (
                        <div className="px-4 pb-2 pt-1.5 border-t border-border/50 relative top-[-25px]">
                          <div className="text-xs text-muted-foreground leading-normal">
                            <span className="font-semibold text-foreground/80">{t.dashboard.whoShouldPlay}</span>
                            <span className="ml-1.5">{whoShouldPlay}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
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
                            {new Date(result.completed_at).toLocaleDateString(language)}
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