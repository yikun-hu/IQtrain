import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getLatestTestResult } from '@/db/api';
import type { TestResult } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Award, Clock, Target, Brain, TrendingUp, Zap, Lock } from 'lucide-react';

// IQ分数区间定义
interface IQLevel {
  min: number;
  max: number;
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  color: string;
  bgColor: string;
}

const IQ_LEVELS: IQLevel[] = [
  {
    min: 0,
    max: 69,
    label: { zh: '智力缺陷', en: 'Intellectual Disability' },
    description: { zh: '需要特殊教育和支持', en: 'Requires special education and support' },
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    min: 70,
    max: 79,
    label: { zh: '临界智力', en: 'Borderline' },
    description: { zh: '可能需要额外的学习支持', en: 'May need additional learning support' },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    min: 80,
    max: 89,
    label: { zh: '中下水平', en: 'Low Average' },
    description: { zh: '智力水平略低于平均值', en: 'Slightly below average intelligence' },
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    min: 90,
    max: 109,
    label: { zh: '平均水平', en: 'Average' },
    description: { zh: '大多数人的智力水平', en: 'Most common intelligence level' },
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    min: 110,
    max: 119,
    label: { zh: '中上水平', en: 'High Average' },
    description: { zh: '智力水平略高于平均值', en: 'Slightly above average intelligence' },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    min: 120,
    max: 129,
    label: { zh: '优秀', en: 'Superior' },
    description: { zh: '智力水平优秀，学习能力强', en: 'Superior intelligence with strong learning ability' },
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    min: 130,
    max: 145,
    label: { zh: '非常优秀', en: 'Very Superior' },
    description: { zh: '智力水平非常优秀，具有天赋', en: 'Very superior intelligence, gifted' },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    min: 146,
    max: 999,
    label: { zh: '天才', en: 'Genius' },
    description: { zh: '极其罕见的智力水平', en: 'Extremely rare intelligence level' },
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export default function ResultPage() {
  const { language } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [iqLevel, setIqLevel] = useState<IQLevel | null>(null);

  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    loadResult();
  }, [user, authLoading]);

  const loadResult = async () => {
    if (!user) return;

    try {
      const data = await getLatestTestResult(user.id);
      if (!data) {
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '未找到测试结果' : 'No test results found',
          variant: 'destructive',
        });
        navigate('/test');
        return;
      }
      setResult(data);
      
      // 根据IQ分数确定等级
      const level = IQ_LEVELS.find(
        (l) => data.iq_score >= l.min && data.iq_score <= l.max
      );
      setIqLevel(level || IQ_LEVELS[3]); // 默认为平均水平
    } catch (error) {
      console.error('加载测试结果失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '加载测试结果失败' : 'Failed to load test results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockReport = () => {
    navigate('/payment?type=one_time');
  };

  // 如果认证状态或结果数据正在加载，显示加载界面
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !iqLevel) {
    return null;
  }

  const dimensionLabels: Record<string, { zh: string; en: string }> = {
    memory: { zh: '记忆力', en: 'Memory' },
    speed: { zh: '速度', en: 'Speed' },
    reaction: { zh: '反应力', en: 'Reaction' },
    concentration: { zh: '专注力', en: 'Concentration' },
    logic: { zh: '逻辑思维', en: 'Logic' },
  };

  const dimensionIcons: Record<string, any> = {
    memory: Brain,
    speed: Zap,
    reaction: Target,
    concentration: Clock,
    logic: TrendingUp,
  };

  // 检查用户是否已支付
  const hasPaid = profile?.has_paid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 xl:text-5xl">
            {language === 'zh' ? '您的IQ测试结果' : 'Your IQ Test Results'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'zh' 
              ? '基于20道标准化测试题目的综合评估' 
              : 'Comprehensive assessment based on 20 standardized test questions'}
          </p>
        </div>

        {/* 主要分数卡片 */}
        <Card className={`mb-8 border-2 ${iqLevel.bgColor} border-${iqLevel.color.split('-')[1]}-200`}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              {/* IQ分数 */}
              <div className={`text-7xl font-bold mb-3 ${iqLevel.color}`}>
                {result.iq_score}
              </div>
              
              {/* IQ等级 */}
              <div className="text-2xl font-semibold mb-2">
                {iqLevel.label[language]}
              </div>
              
              {/* IQ描述 */}
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {iqLevel.description[language]}
              </p>

              {/* 统计信息 */}
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto md:grid-cols-3">
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
                  <Target className="h-6 w-6 mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === 'zh' ? '准确率' : 'Accuracy'}
                  </div>
                  <div className="text-2xl font-bold">{result.score}%</div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
                  <Clock className="h-6 w-6 mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === 'zh' ? '用时' : 'Time Taken'}
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
                  <Award className="h-6 w-6 mb-2 text-primary" />
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === 'zh' ? '完成题数' : 'Questions'}
                  </div>
                  <div className="text-2xl font-bold">20/20</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 维度分数 - 根据是否支付显示不同内容 */}
        {hasPaid ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {language === 'zh' ? '认知能力详细分析' : 'Detailed Cognitive Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {Object.entries(result.dimension_scores).map(([dimension, score]) => {
                  const Icon = dimensionIcons[dimension] || Brain;
                  return (
                    <div key={dimension} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold">
                            {dimensionLabels[dimension]?.[language] || dimension}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{score}</span>
                      </div>
                      <Progress value={score} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {score >= 80 && (language === 'zh' ? '表现优秀' : 'Excellent performance')}
                        {score >= 60 && score < 80 && (language === 'zh' ? '表现良好' : 'Good performance')}
                        {score >= 40 && score < 60 && (language === 'zh' ? '表现一般' : 'Average performance')}
                        {score < 40 && (language === 'zh' ? '需要提升' : 'Needs improvement')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {language === 'zh' ? '解锁完整报告' : 'Unlock Full Report'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {language === 'zh' 
                    ? '支付后即可查看详细的认知能力分析、个性化训练建议和可打印证书' 
                    : 'Get detailed cognitive analysis, personalized training recommendations, and printable certificate'}
                </p>
                
                {/* 预览维度（模糊效果） */}
                <div className="grid gap-4 max-w-2xl mx-auto mb-6 md:grid-cols-2">
                  {Object.keys(result.dimension_scores).slice(0, 4).map((dimension) => {
                    const Icon = dimensionIcons[dimension] || Brain;
                    return (
                      <div key={dimension} className="p-4 bg-background/50 rounded-lg border blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {dimensionLabels[dimension]?.[language] || dimension}
                            </span>
                          </div>
                          <span className="text-lg font-bold">??</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleUnlockReport}
                >
                  <Award className="h-5 w-5 mr-2" />
                  {language === 'zh' ? '立即解锁 - 仅需 $1.98' : 'Unlock Now - Only $1.98'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 行动按钮 */}
        <div className="flex flex-col gap-4 md:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/dashboard')}
          >
            {language === 'zh' ? '返回仪表盘' : 'Back to Dashboard'}
          </Button>
          
          {hasPaid && (
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => navigate('/certificate')}
            >
              <Award className="h-5 w-5 mr-2" />
              {language === 'zh' ? '下载证书' : 'Download Certificate'}
            </Button>
          )}
          
          {!hasPaid && (
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleUnlockReport}
            >
              <Lock className="h-5 w-5 mr-2" />
              {language === 'zh' ? '解锁完整报告' : 'Unlock Full Report'}
            </Button>
          )}
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {language === 'zh' 
              ? '* IQ测试结果仅供参考，不代表个人全部能力' 
              : '* IQ test results are for reference only and do not represent all personal abilities'}
          </p>
        </div>
      </div>
    </div>
  );
}
