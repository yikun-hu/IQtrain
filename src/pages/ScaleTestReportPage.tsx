import { useState, useEffect } from 'react';
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

export default function ScaleTestReportPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [result, setResult] = useState<any>(null);
  const [scoringRule, setScoringRule] = useState<ScaleScoringRule | null>(null);
  const [testConfig, setTestConfig] = useState<ScaleTestConfig | null>(null);
  const [allLevels, setAllLevels] = useState<ScaleScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  const tScaleTestReport = t.scaleTestReport;

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
      if (!testResult) throw new Error(tScaleTestReport.errNoResult);

      if (testResult.user_id !== user?.id) throw new Error(tScaleTestReport.errNoPermission);

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
        title: tScaleTestReport.loadingFailed,
        description: tScaleTestReport.failedLoadReport,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    const title = testConfig?.name || tScaleTestReport.shareTitleFallback;
    const text = tScaleTestReport.shareText(result?.iq_score, scoringRule?.label);

    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: tScaleTestReport.linkCopied,
        description: tScaleTestReport.linkCopiedDesc,
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
            <p className="text-muted-foreground">{tScaleTestReport.reportNotFound}</p>
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

  const dateLocale = language;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 标题 / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{testConfig.name}</h1>
          <p className="text-muted-foreground">{tScaleTestReport.scientificSubtitle}</p>
        </div>

        {/* 核心分数卡片 / Core score */}
        <Card className="mb-8 shadow-lg" style={{ borderColor: scoringRule.color }}>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-2">{tScaleTestReport.level}</div>
                <div className="text-2xl font-bold" style={{ color: scoringRule.color }}>
                  {scoringRule.label}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{tScaleTestReport.totalScore}</div>
                <div className="text-3xl font-bold">{totalScore}</div>
                <div className="text-sm text-muted-foreground">{tScaleTestReport.fullScore(maxScore)}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{tScaleTestReport.percentile}</div>
                <div className="text-3xl font-bold" style={{ color: scoringRule.color }}>
                  {percentile}%
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">{tScaleTestReport.testDate}</div>
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
                {tScaleTestReport.yourScore(totalScore, scorePercentage.toFixed(1))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 报告概览 / Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tScaleTestReport.overview}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {tScaleTestReport.overviewP1(testConfig.name)}
              <span className="font-bold mx-1" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </span>
              {tScaleTestReport.overviewP1_2(percentile)}
            </p>
            <p className="text-muted-foreground leading-relaxed">{tScaleTestReport.overviewP2}</p>
          </CardContent>
        </Card>

        {/* 分数解读 / Interpretation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tScaleTestReport.interpretationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${scoringRule.color}15` }}>
              <h3 className="font-semibold text-lg mb-2" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{scoringRule.interpretation}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{tScaleTestReport.personalizedFeedback}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{scoringRule.feedback}</p>
            </div>
          </CardContent>
        </Card>

        {/* 能力维度分析 / Dimensions */}
        {scoringRule.ability_dimensions && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{tScaleTestReport.abilityDim}</CardTitle>
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
            <CardTitle>{tScaleTestReport.adviceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">{tScaleTestReport.improvementAdvice}</h4>
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
                <h4 className="font-semibold mb-3">{tScaleTestReport.plan30}</h4>
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
            <h3 className="text-2xl font-bold mb-2">{tScaleTestReport.certificate}</h3>
            <p className="text-muted-foreground mb-4">
              {tScaleTestReport.certP1(testConfig.name)}
              <span className="font-bold mx-1" style={{ color: scoringRule.color }}>
                {scoringRule.label}
              </span>
              {tScaleTestReport.certP1_2(testConfig.name, totalScore)}
            </p>
            <p className="text-sm text-muted-foreground">{tScaleTestReport.certP2(percentile)}</p>
            <p className="text-xs text-muted-foreground mt-4">{tScaleTestReport.certNote}</p>
          </CardContent>
        </Card>

        {/* 操作按钮 / Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={handlePrint} variant="outline" size="lg">
            <Download className="mr-2 h-4 w-4" />
            {tScaleTestReport.print}
          </Button>
          <Button onClick={handleShare} variant="outline" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            {tScaleTestReport.share}
          </Button>
          <Button onClick={() => navigate('/dashboard')} size="lg">
            {tScaleTestReport.back}
          </Button>
        </div>

        {/* 免责声明 / Disclaimer */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">{tScaleTestReport.disclaimerTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{tScaleTestReport.d1}</p>
            <p>{tScaleTestReport.d2}</p>
            <p>{tScaleTestReport.d3}</p>
            <p>{tScaleTestReport.d4}</p>
            <p>{tScaleTestReport.d5}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}