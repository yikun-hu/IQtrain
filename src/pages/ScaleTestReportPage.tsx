import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download, Share2, Award } from 'lucide-react';
import {
  getScaleTestResultById,
  getScaleScoringRuleByScore,
  getScaleTestConfig,
  getScaleScoringRules,
} from '@/db/api';
import type { ScaleScoringRule, ScaleTestConfig } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

type Lang = 'zh' | 'en';

export default function ScaleTestReportPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { language } = useLanguage() as { language: Lang };
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [result, setResult] = useState<any>(null);
  const [scoringRule, setScoringRule] = useState<ScaleScoringRule | null>(null);
  const [testConfig, setTestConfig] = useState<ScaleTestConfig | null>(null);
  const [allLevels, setAllLevels] = useState<ScaleScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useMemo(() => {
    const dict = {
      zh: {
        loadingFailed: '加载失败',
        failedLoadReport: '无法加载测试报告',
        reportNotFound: '报告不存在',
        scientificSubtitle: '基于科学心理量表的个性化评估与分析',
        level: '等级',
        totalScore: '测试总分',
        fullScore: (max: number) => `满分${max}`,
        percentile: '人群百分位',
        testDate: '测试日期',
        yourScore: (score: number, pct: string) => `您的分数：${score}分（${pct}%）`,
        overview: '报告概览',
        overviewP1: (testName: string) => `尊敬的测试者，根据您在${testName}中的表现，我们评估您的能力处于`,
        overviewP1_2: (pct: number) => `。此级别对应人群前${pct}%的位置。`,
        overviewP2: '本报告基于您完成的10道题目，从多个维度分析您的能力特点，并提供个性化发展建议。',
        interpretationTitle: '分数解读',
        personalizedFeedback: '个性化反馈',
        abilityDim: '能力维度分析',
        adviceTitle: '建议与行动指南',
        improvementAdvice: '提升建议',
        plan30: '30天行动计划',
        certificate: '测试证书',
        certP1: (testName: string) => `兹证明测试者在本${testName}中表现出`,
        certP1_2: (testName: string, score: number) => `，测试总分为${score}分。`,
        certP2: (pct: number) => `此级别对应人群前${pct}%的水平。`,
        certNote: '* 此证书证明测试者在测试中的表现，非正式诊断或评估证书。',
        print: '打印报告',
        share: '分享报告',
        back: '返回仪表盘',
        linkCopied: '链接已复制',
        linkCopiedDesc: '报告链接已复制到剪贴板',
        shareTitleFallback: '测试报告',
        shareText: (score?: number, label?: string) => `我的测试分数：${score ?? '-'}分，等级：${label ?? '-'}`,
        disclaimerTitle: '重要声明与使用说明',
        d1: '1. 本测试为心理能力自评量表，非正式心理诊断工具。',
        d2: '2. 测试结果受环境、状态、对题型熟悉度等多种因素影响，建议在放松状态下测试。',
        d3: '3. 心理能力可通过训练提升，本报告结果反映当前测试表现。',
        d4: '4. 正式的心理评估需由专业人员在标准化环境下进行，本报告结果仅供参考。',
        d5: '5. 如测试结果显示极高压力或极低满意度，建议寻求专业心理咨询支持。',
        errNoResult: '测试结果不存在',
        errNoPermission: '无权访问此报告',
      },
      en: {
        loadingFailed: 'Loading Failed',
        failedLoadReport: 'Failed to load test report',
        reportNotFound: 'Report not found',
        scientificSubtitle: 'Personalized assessment and analysis based on scientific psychological scales',
        level: 'Level',
        totalScore: 'Total Score',
        fullScore: (max: number) => `Out of ${max}`,
        percentile: 'Percentile',
        testDate: 'Test Date',
        yourScore: (score: number, pct: string) => `Your score: ${score} (${pct}%)`,
        overview: 'Report Overview',
        overviewP1: (testName: string) =>
          `Based on your performance in ${testName}, we evaluate your ability level as`,
        overviewP1_2: (pct: number) => `. This corresponds to the top ${pct}% of the population.`,
        overviewP2:
          'This report analyzes your performance across multiple dimensions based on 10 questions and provides personalized development suggestions.',
        interpretationTitle: 'Score Interpretation',
        personalizedFeedback: 'Personalized Feedback',
        abilityDim: 'Ability Dimension Analysis',
        adviceTitle: 'Recommendations & Action Guide',
        improvementAdvice: 'Suggestions to Improve',
        plan30: '30-Day Action Plan',
        certificate: 'Certificate',
        certP1: (testName: string) => `This certifies that the test taker demonstrated`,
        certP1_2: (testName: string, score: number) => `in ${testName}, with a total score of ${score}.`,
        certP2: (pct: number) => `This level corresponds to the top ${pct}% of the population.`,
        certNote:
          '* This certificate reflects performance in the test and is not a formal diagnosis or official assessment certificate.',
        print: 'Print Report',
        share: 'Share Report',
        back: 'Back to Dashboard',
        linkCopied: 'Link Copied',
        linkCopiedDesc: 'Report link copied to clipboard',
        shareTitleFallback: 'Test Report',
        shareText: (score?: number, label?: string) =>
          `My test score: ${score ?? '-'}, level: ${label ?? '-'}`,
        disclaimerTitle: 'Important Notes & Usage',
        d1: '1. This test is a self-assessment scale and not a formal diagnostic tool.',
        d2:
          '2. Results may be affected by environment, current state, and familiarity with the question types. Take the test when relaxed.',
        d3:
          '3. Abilities can be improved through training. This report reflects your current performance.',
        d4:
          '4. Formal psychological assessment should be conducted by professionals in a standardized environment. This report is for reference only.',
        d5:
          '5. If results indicate very high stress or very low satisfaction, consider seeking professional support.',
        errNoResult: 'Test result does not exist',
        errNoPermission: 'You do not have permission to view this report',
      },
    } as const;

    return dict[language] ?? dict.zh;
  }, [language]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId, user, language]); // language 切换时也重新拉取（如果后端返回已翻译字段）

  const loadReport = async () => {
    if (!resultId) return;

    try {
      setLoading(true);

      const testResult = await getScaleTestResultById(resultId);
      if (!testResult) throw new Error(t.errNoResult);

      if (testResult.user_id !== user?.id) throw new Error(t.errNoPermission);

      setResult(testResult);

      const rule = await getScaleScoringRuleByScore(
        testResult.test_type,
        testResult.iq_score,
        language
      );
      setScoringRule(rule);

      const config = await getScaleTestConfig(testResult.test_type, language);
      setTestConfig(config);

      const levels = await getScaleScoringRules(testResult.test_type, language);
      setAllLevels(levels);
    } catch (error) {
      console.error('加载报告失败:', error);
      toast({
        title: t.loadingFailed,
        description: t.failedLoadReport,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    const title = testConfig?.name || t.shareTitleFallback;
    const text = t.shareText(result?.iq_score, scoringRule?.label);

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t.linkCopied,
        description: t.linkCopiedDesc,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !scoringRule || !testConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t.reportNotFound}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalScore = result.iq_score;
  const level = scoringRule.level;
  const percentile = result.dimension_scores?.percentile || 50;
  const maxScore = 50; // 10题 × 5分
  const scorePercentage = (totalScore / maxScore) * 100;

  const dateLocale = language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 标题 / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{testConfig.name}</h1>
          <p className="text-muted-foreground">{t.scientificSubtitle}</p>
        </div>

        {/* 核心分数卡片 / Core score */}
        <Card className="mb-8 shadow-lg" style={{ borderColor: scoringRule.color }}>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-2">{t.level}</div>
                <div className="text-2xl font-bold" style={{ color: scoringRule.color }}>
                  {scoringRule.label}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{t.totalScore}</div>
                <div className="text-3xl font-bold">{totalScore}</div>
                <div className="text-sm text-muted-foreground">{t.fullScore(maxScore)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{t.percentile}</div>
                <div className="text-3xl font-bold" style={{ color: scoringRule.color }}>
                  {percentile}%
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{t.testDate}</div>
                <div className="text-lg font-semibold">
                  {new Date(result.completed_at).toLocaleDateString(dateLocale)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 等级进度条 / Level progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm flex-wrap gap-2">
                {allLevels.map((lvl) => (
                  <span
                    key={lvl.level}
                    className={lvl.level === level ? 'font-bold' : ''}
                    style={{ color: lvl.level === level ? lvl.color : undefined }}
                  >
                    {lvl.label}
                  </span>
                ))}
              </div>

              <div className="relative">
                <Progress value={scorePercentage} className="h-3" />
                <div
                  className="absolute top-0 h-3 rounded-full transition-all"
                  style={{
                    width: `${scorePercentage}%`,
                    backgroundColor: scoringRule.color,
                  }}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {t.yourScore(totalScore, scorePercentage.toFixed(1))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 报告概览 / Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.overview}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.overviewP1(testConfig.name)}
              <span className="font-bold mx-1" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </span>
              {t.overviewP1_2(percentile)}
            </p>
            <p className="text-muted-foreground leading-relaxed">{t.overviewP2}</p>
          </CardContent>
        </Card>

        {/* 分数解读 / Interpretation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.interpretationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${scoringRule.color}15` }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{scoringRule.interpretation}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t.personalizedFeedback}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{scoringRule.feedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* 能力维度分析 / Dimensions */}
        {scoringRule.ability_dimensions && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t.abilityDim}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scoringRule.ability_dimensions).map(([dimension, score]) => (
                  <div key={dimension}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{dimension}</span>
                      <span className="font-semibold" style={{ color: scoringRule.color }}>
                        {score}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={Number(score)} className="h-2" />
                      <div
                        className="absolute top-0 h-2 rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor: scoringRule.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 建议与行动指南 / Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.adviceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">{t.improvementAdvice}</h4>
                <ul className="space-y-2">
                  {testConfig.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">{t.plan30}</h4>
                <ul className="space-y-2">
                  {testConfig.action_plan.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 font-semibold" style={{ color: scoringRule.color }}>
                        {index + 1}.
                      </span>
                      <span className="text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 证书 / Certificate */}
        <Card
          className="mb-8"
          style={{
            background: `linear-gradient(135deg, ${scoringRule.color}10, ${scoringRule.color}05)`,
          }}
        >
          <CardContent className="p-8 text-center">
            <Award className="h-16 w-16 mx-auto mb-4" style={{ color: scoringRule.color }} />
            <h3 className="text-2xl font-bold mb-2">{t.certificate}</h3>
            <p className="text-muted-foreground mb-4">
              {t.certP1(testConfig.name)}
              <span className="font-bold mx-1" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </span>
              {t.certP1_2(testConfig.name, totalScore)}
            </p>
            <p className="text-sm text-muted-foreground">{t.certP2(percentile)}</p>
            <p className="text-xs text-muted-foreground mt-4">{t.certNote}</p>
          </CardContent>
        </Card>

        {/* 操作按钮 / Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={handlePrint} variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {t.print}
          </Button>
          <Button onClick={handleShare} variant="outline" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            {t.share}
          </Button>
          <Button onClick={() => navigate('/dashboard')} size="lg">
            {t.back}
          </Button>
        </div>

        {/* 免责声明 / Disclaimer */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">{t.disclaimerTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t.d1}</p>
            <p>{t.d2}</p>
            <p>{t.d3}</p>
            <p>{t.d4}</p>
            <p>{t.d5}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}