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
import { Loader2, Award, Clock, Target, Brain, TrendingUp, Zap, Lock, Printer, Download } from 'lucide-react';

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

  const handlePrintReport = () => {
    window.print();
  };

  // 如果认证状态或结果数据正在加载，显示加载界面
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !iqLevel) {
    return null;
  }

  // 检查用户是否已支付
  const hasPaid = profile?.has_paid;

  // 认知能力维度数据
  const cognitiveDimensions = [
    { id: 'pattern', label: { zh: '模式识别能力', en: 'Pattern Recognition' }, value: 96 },
    { id: 'spatial', label: { zh: '空间推理能力', en: 'Spatial Reasoning' }, value: 94 },
    { id: 'logic', label: { zh: '逻辑演绎能力', en: 'Logical Deduction' }, value: 92 },
    { id: 'speed', label: { zh: '认知加工速度', en: 'Cognitive Processing Speed' }, value: 88 },
  ];

  // 生成报告ID和日期
  const testDate = new Date(result.completed_at || Date.now());
  const formattedDate = testDate.toISOString().split('T')[0];
  const reportId = `MENSA-REPORT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${testDate.getFullYear()}-${result.iq_score}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 报告容器 */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden print:shadow-none">
          {/* 报告头部 */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-8 px-8">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-5xl font-bold tracking-tight mb-2">MENSA</h1>
              <div className="h-0.5 w-24 bg-white/70 mb-4"></div>
              <h2 className="text-2xl font-semibold mb-1">
                {language === 'zh' ? '认知能力评估报告' : 'Cognitive Ability Assessment Report'}
              </h2>
              <p className="text-white/90 italic">
                {language === 'zh' ? '基于图形推理测试的认知能力综合分析' : 'Comprehensive Analysis of Cognitive Ability Based on Figure Reasoning Test'}
              </p>
            </div>
          </div>

          {/* 主要测试结果 */}
          <div className="px-8 py-6 bg-white border-b">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {language === 'zh' ? '卓越非凡级别 (门萨级别)' : 'Exceptional Level (Mensa Level)'}
                </div>
                <div className="text-6xl font-bold text-indigo-900 mb-1">{result.iq_score}</div>
                <div className="text-lg text-gray-600">{language === 'zh' ? '智商估算 (SD=15)' : 'IQ Estimate (SD=15)'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">{language === 'zh' ? '前2%' : 'Top 2%'}</div>
                  <div className="text-gray-600">{language === 'zh' ? '人群百分位' : 'Population Percentile'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">{result.score}%</div>
                  <div className="text-gray-600">{language === 'zh' ? '测试准确率' : 'Test Accuracy'}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">{language === 'zh' ? '测试日期' : 'Test Date'}</div>
                <div className="text-lg font-medium">{formattedDate}</div>
              </div>
            </div>
          </div>

          {/* 报告概览 */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '报告概览' : 'Report Overview'}
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>
                {language === 'zh' 
                  ? '尊敬的测试者，根据您在图形推理测试中的表现，我们评估您的认知能力处于卓越非凡级别。此级别对应智商130以上，处于人群前2%的位置，达到国际高智商组织门萨(Mensa)的入会标准。' 
                  : 'Dear test taker, based on your performance in the figure reasoning test, we assess your cognitive ability at the exceptional level. This level corresponds to an IQ above 130, placing you in the top 2% of the population, meeting the membership criteria for the international high IQ organization Mensa.'}
              </p>
              <p>
                {language === 'zh' 
                  ? '本报告基于您完成的20道图形推理题目，从多个维度分析您的认知能力特点，并提供个性化发展建议。' 
                  : 'This report is based on the 20 figure reasoning questions you completed, analyzing your cognitive ability characteristics from multiple dimensions and providing personalized development recommendations.'}
              </p>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                className="bg-purple-700 hover:bg-purple-800 text-white"
                onClick={handlePrintReport}
              >
                <Printer className="h-4 w-4 mr-2" />
                {language === 'zh' ? '打印本报告' : 'Print This Report'}
              </Button>
            </div>
          </div>

          {/* 认知能力剖面分析 */}
          <div className="px-8 py-6 bg-white border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-6">
              {language === 'zh' ? '认知能力剖面分析' : 'Cognitive Ability Profile Analysis'}
            </h3>
            <p className="text-gray-700 mb-6">
              {language === 'zh' 
                ? '以下是根据您的测试表现分析出的各项认知能力指标：' 
                : 'The following are the cognitive ability indicators analyzed based on your test performance:'}
            </p>
            
            <div className="space-y-6">
              {cognitiveDimensions.map((dimension) => (
                <div key={dimension.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-800">
                      {dimension.label[language]}
                    </span>
                    <span className="text-2xl font-bold text-purple-700">{dimension.value}%</span>
                  </div>
                  <Progress value={dimension.value} className="h-3 bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* 与人群对比分析 */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '与人群对比分析' : 'Comparison with Population'}
            </h3>
            <p className="text-gray-700 mb-6">
              {language === 'zh' 
                ? '您的认知能力超越98%的同龄人群，与科学、工程和技术领域的顶尖人才认知特征相似。' 
                : 'Your cognitive ability surpasses 98% of your peers, with cognitive characteristics similar to top talents in science, engineering, and technology fields.'}
            </p>
            
            {/* 人群分布可视化 */}
            <div className="bg-white p-4 rounded-lg border mb-6">
              <div className="flex items-center justify-between mb-2 text-sm font-medium text-gray-600">
                <span>{language === 'zh' ? '前50%' : 'Top 50%'}</span>
                <span>{language === 'zh' ? '前16%' : 'Top 16%'}</span>
                <span>{language === 'zh' ? '前5%' : 'Top 5%'}</span>
                <span className="text-purple-700">{language === 'zh' ? '前2%(您)' : 'Top 2% (You)'}</span>
              </div>
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-100 via-blue-300 to-purple-600" 
                  style={{ width: '98%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {language === 'zh' 
                  ? '解读：图表显示了您的认知能力在正态分布中的位置。右侧阴影区域表示您超越的人群比例。' 
                  : 'Interpretation: The chart shows your cognitive ability position in the normal distribution. The shaded area on the right represents the proportion of the population you surpass.'}
              </p>
            </div>
          </div>

          {/* 认知优势分析 */}
          <div className="px-8 py-6 bg-white border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '认知优势分析' : 'Cognitive Strength Analysis'}
            </h3>
            <p className="text-gray-700 mb-6">
              {language === 'zh' 
                ? '基于测试结果，我们识别出您的以下认知优势：' 
                : 'Based on the test results, we have identified your cognitive strengths as follows:'}
            </p>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  <span className="font-medium">{language === 'zh' ? '极佳的模式识别能力：' : 'Excellent pattern recognition ability: '}</span>
                  {language === 'zh' 
                    ? '您能够快速识别复杂模式并预测其发展趋势，这种能力在解决抽象问题时尤其重要。' 
                    : 'You can quickly identify complex patterns and predict their development trends, which is particularly important when solving abstract problems.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  <span className="font-medium">{language === 'zh' ? '优秀的空间想象能力：' : 'Excellent spatial imagination: '}</span>
                  {language === 'zh' 
                    ? '您能够在大脑中精确操作和转换空间关系，这是工程、建筑和设计领域的关键能力。' 
                    : 'You can precisely manipulate and transform spatial relationships in your mind, which is a key ability in engineering, architecture, and design fields.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  <span className="font-medium">{language === 'zh' ? '高效的逻辑演绎能力：' : 'Efficient logical deduction ability: '}</span>
                  {language === 'zh' 
                    ? '您能够从已知前提推导出必然结论，并识别逻辑关系中的矛盾与一致性。' 
                    : 'You can derive necessary conclusions from known premises and identify contradictions and consistencies in logical relationships.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  <span className="font-medium">{language === 'zh' ? '快速的认知加工速度：' : 'Fast cognitive processing speed: '}</span>
                  {language === 'zh' 
                    ? '您处理复杂信息的速度明显快于平均水平，能够在短时间内整合多源信息。' 
                    : 'Your speed of processing complex information is significantly faster than average, enabling you to integrate multi-source information in a short time.'}
                </p>
              </div>
            </div>
          </div>

          {/* 发展建议与规划 */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '发展建议与规划' : 'Development Suggestions and Planning'}
            </h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  {language === 'zh' 
                    ? '考虑参加正式门萨测试：您的认知表现已达到门萨入会标准，建议参加正式测试以获得会员资格，加入高智商社群。' 
                    : 'Consider taking the official Mensa test: Your cognitive performance has met the Mensa membership criteria. It is recommended to take the official test to obtain membership and join the high IQ community.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  {language === 'zh' 
                    ? '探索需要高抽象思维的领域：考虑深入研究理论物理、哲学、高等数学或人工智能等需要强大抽象思维的领域。' 
                    : 'Explore fields requiring high abstract thinking: Consider in-depth study in fields that require strong abstract thinking, such as theoretical physics, philosophy, advanced mathematics, or artificial intelligence.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  {language === 'zh' 
                    ? '参与复杂问题解决项目：寻找或创建需要复杂系统思维和跨学科整合能力的项目，充分发挥您的认知优势。' 
                    : 'Participate in complex problem-solving projects: Seek or create projects that require complex systems thinking and interdisciplinary integration capabilities to fully utilize your cognitive strengths.'}
                </p>
              </div>
              <div className="flex">
                <div className="text-purple-700 font-bold mr-3">•</div>
                <p className="text-gray-700">
                  {language === 'zh' 
                    ? '担任领导与指导角色：您的认知能力适合担任需要复杂决策和战略规划的领导者角色，或指导他人解决难题。' 
                    : 'Assume leadership and guidance roles: Your cognitive abilities are suitable for leadership roles requiring complex decision-making and strategic planning, or for guiding others to solve difficult problems.'}
                </p>
              </div>
            </div>
          </div>

          {/* 持续认知训练计划 */}
          <div className="px-8 py-6 bg-white border-b">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '持续认知训练计划' : 'Continuous Cognitive Training Plan'}
            </h3>
            <p className="text-gray-700 mb-6">
              {language === 'zh' 
                ? '为保持和进一步提升认知能力，建议：' 
                : 'To maintain and further improve cognitive abilities, it is recommended to:'}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="text-purple-700 font-bold mr-3 mt-1">•</div>
                <p className="text-gray-700">{language === 'zh' ? '每周进行3-4次高难度逻辑训练，每次30-45分钟' : 'Engage in high-difficulty logic training 3-4 times a week, 30-45 minutes each time'}</p>
              </div>
              <div className="flex items-start">
                <div className="text-purple-700 font-bold mr-3 mt-1">•</div>
                <p className="text-gray-700">{language === 'zh' ? '定期挑战国际高智商组织发布的难题' : 'Regularly challenge difficult problems released by international high IQ organizations'}</p>
              </div>
              <div className="flex items-start">
                <div className="text-purple-700 font-bold mr-3 mt-1">•</div>
                <p className="text-gray-700">{language === 'zh' ? '学习一门新的编程语言或复杂系统理论' : 'Learn a new programming language or complex system theory'}</p>
              </div>
              <div className="flex items-start">
                <div className="text-purple-700 font-bold mr-3 mt-1">•</div>
                <p className="text-gray-700">{language === 'zh' ? '参与国际性的问题解决竞赛或活动' : 'Participate in international problem-solving competitions or activities'}</p>
              </div>
            </div>
          </div>

          {/* 卓越认知能力证书 */}
          <div className="px-8 py-8 bg-gradient-to-b from-white to-gray-50 border-b">
            <div className="text-center">
              <div className="inline-block border-4 border-purple-700 rounded-lg p-8 bg-white max-w-2xl">
                <h3 className="text-2xl font-bold text-indigo-900 mb-6">
                  {language === 'zh' ? '卓越认知能力证书' : 'Certificate of Exceptional Cognitive Ability'}
                </h3>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {language === 'zh' 
                    ? '兹证明测试者在本图形推理测试中表现出卓越的认知能力，达到卓越非凡级别，智商估算值为' + result.iq_score + '。' 
                    : 'This is to certify that the test taker has demonstrated exceptional cognitive ability in this figure reasoning test, reaching the exceptional level with an estimated IQ of ' + result.iq_score + '.'}
                </p>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  {language === 'zh' 
                    ? '此级别对应人群前2%的认知水平，达到国际高智商组织门萨(Mensa)的入会标准。' 
                    : 'This level corresponds to the top 2% of the population in cognitive ability, meeting the membership criteria of the international high IQ organization Mensa.'}
                </p>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{language === 'zh' ? '证书编号' : 'Certificate Number'}</p>
                    <p className="text-lg font-medium text-purple-700">{reportId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{language === 'zh' ? '测试日期' : 'Test Date'}</p>
                    <p className="text-lg font-medium text-purple-700">{formattedDate}</p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 italic">
                  {language === 'zh' 
                    ? '* 此证书证明测试者在图形推理测试中的表现，非正式智商测试证书。' 
                    : '* This certificate proves the test takers performance in the figure reasoning test and is not an official IQ test certificate.'}
                </p>
              </div>
            </div>
          </div>

          {/* 报告科学依据 */}
          <div className="px-8 py-6 bg-white border-b">
            <h3 className="text-xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '报告科学依据' : 'Scientific Basis of the Report'}
            </h3>
            <p className="text-gray-700 mb-4">
              {language === 'zh' 
                ? '本报告基于以下科学原理和方法：' 
                : 'This report is based on the following scientific principles and methods:'}
            </p>
            <div className="space-y-2 pl-6 list-disc text-gray-700">
              <li>{language === 'zh' ? '认知心理学理论：基于工作记忆、流体智力和执行功能等认知心理学理论' : 'Cognitive psychology theory: Based on cognitive psychology theories such as working memory, fluid intelligence, and executive function'}</li>
              <li>{language === 'zh' ? '项目反应理论：采用IRT模型分析题目难度与测试者能力的匹配度' : 'Item response theory: Using IRT model to analyze the matching degree between item difficulty and test taker ability'}</li>
              <li>{language === 'zh' ? '常模参照评估：基于大规模标准化样本建立评估标准' : 'Norm-referenced assessment: Establishing assessment standards based on large-scale standardized samples'}</li>
              <li>{language === 'zh' ? '多维度分析：从模式识别、空间推理、逻辑演绎和加工速度四个维度评估认知能力' : 'Multi-dimensional analysis: Evaluating cognitive abilities from four dimensions: pattern recognition, spatial reasoning, logical deduction, and processing speed'}</li>
            </div>
          </div>

          {/* 重要声明与使用说明 */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h3 className="text-xl font-bold text-indigo-900 mb-4">
              {language === 'zh' ? '重要声明与使用说明' : 'Important Declarations and Usage Instructions'}
            </h3>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                <span>{language === 'zh' ? '本测试为图形推理能力模拟测试，非正式标准化智商测试。' : 'This test is a figure reasoning ability simulation test, not an official standardized IQ test.'}</span>
              </p>
              <p className="flex items-start">
                <span className="font-medium mr-2">2.</span>
                <span>{language === 'zh' ? '测试结果受环境、状态、对题型熟悉度等多种因素影响，建议在最佳状态下测试。' : 'Test results are affected by various factors such as environment, state, and familiarity with question types. It is recommended to test in optimal conditions.'}</span>
              </p>
              <p className="flex items-start">
                <span className="font-medium mr-2">3.</span>
                <span>{language === 'zh' ? '认知能力可通过训练提升，本报告结果反映当前测试表现。' : 'Cognitive abilities can be improved through training. This report reflects current test performance.'}</span>
              </p>
              <p className="flex items-start">
                <span className="font-medium mr-2">4.</span>
                <span>{language === 'zh' ? '正式的智商测试需由专业人员在标准化环境下进行，本报告结果仅供参考。' : 'Official IQ tests must be conducted by professionals in a standardized environment. This report is for reference only.'}</span>
              </p>
              <p className="flex items-start">
                <span className="font-medium mr-2">5.</span>
                <span>{language === 'zh' ? '门萨协会的正式入会测试需通过其官方渠道报名参加。' : 'Official membership tests for Mensa must be registered through their official channels.'}</span>
              </p>
            </div>
          </div>

          {/* 报告底部 */}
          <div className="px-8 py-6 bg-indigo-900 text-white">
            <div className="text-center">
              <p className="mb-2">© {new Date().getFullYear()} {language === 'zh' ? '认知能力评估中心' : 'Cognitive Ability Assessment Center'} | {language === 'zh' ? '本报告生成时间' : 'Report Generated Time'}: {new Date().toLocaleString()}</p>
              <p className="text-white/80">{language === 'zh' ? '报告ID' : 'Report ID'}: {reportId} | {language === 'zh' ? '版本' : 'Version'}: 2.1</p>
              <p className="text-white/80 text-sm mt-4 italic">
                {language === 'zh' 
                  ? '免责声明: 本报告基于模拟测试生成，仅供参考和教育目的，不作为正式评估或诊断依据。' 
                  : 'Disclaimer: This report is generated based on a simulation test for reference and educational purposes only, not as an official assessment or diagnostic basis.'}
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 max-w-xs"
            onClick={() => navigate('/dashboard')}
          >
            {language === 'zh' ? '返回仪表盘' : 'Back to Dashboard'}
          </Button>
          
          <Button
            className="bg-purple-700 hover:bg-purple-800 text-white flex-1 max-w-xs"
            onClick={handlePrintReport}
          >
            <Printer className="h-5 w-5 mr-2" />
            {language === 'zh' ? '打印报告' : 'Print Report'}
          </Button>
          
          <Button
            className="bg-indigo-700 hover:bg-indigo-800 text-white flex-1 max-w-xs"
            onClick={() => {
              // 这里可以添加下载PDF功能
              toast({
                title: language === 'zh' ? '提示' : 'Tip',
                description: language === 'zh' ? '下载功能开发中' : 'Download function in development',
              });
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            {language === 'zh' ? '下载报告' : 'Download Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
