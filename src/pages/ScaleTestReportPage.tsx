import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download, Share2, Award } from 'lucide-react';
import {
  getScaleScoringRuleByScore,
  getScaleScoringRules,
  getScaleTestConfig,
  getScaleTestResultById,
} from '@/db/api';
import type { ScaleScoringRule, ScaleTestConfig } from '@/types/types';
import { useToast } from '@/hooks/use-toast';


type Lang = 'zh-CN' | 'en-US';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function applyTemplate(template: string, vars: Record<string, string | number | undefined>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? '' : String(v);
  });
}
function formatDateYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * ✅ 分类定义（按你提供的结构）
 * 这里只在本页用到：name / shortName / levels
 * 其它 interpretations/feedbacks/... 你后续要用也可以直接继续扩展
 */
const testData: Record<string, {
  name: string;
  shortName: string;
  levels: { range: [number, number]; label: string; color: string }[];
}> = {
  emotional_recognition: {
    name: '情绪识别能力测试',
    shortName: 'EQ',
    levels: [
      { range: [20, 36], label: '基础水平', color: '#FF6B6B' },
      { range: [37, 52], label: '发展水平', color: '#FFA726' },
      { range: [53, 68], label: '平均水平', color: '#42A5F5' },
      { range: [69, 84], label: '熟练水平', color: '#66BB6A' },
      { range: [85, 100], label: '专家水平', color: '#8A2BE2' },
    ],
  },
  stress_index: {
    name: '压力指数自检',
    shortName: 'STR',
    levels: [
      { range: [20, 36], label: '低压力水平', color: '#66BB6A' },
      { range: [37, 52], label: '中等偏下压力', color: '#42A5F5' },
      { range: [53, 68], label: '中等压力', color: '#FFA726' },
      { range: [69, 84], label: '高压力水平', color: '#FF6B6B' },
      { range: [85, 100], label: '极高压力', color: '#D32F2F' },
    ],
  },
  psychological_resilience: {
    name: '心理韧性测试',
    shortName: 'RES',
    levels: [
      { range: [20, 36], label: '较低心理韧性', color: '#FF6B6B' },
      { range: [37, 52], label: '发展中的心理韧性', color: '#FFA726' },
      { range: [53, 68], label: '中等心理韧性', color: '#42A5F5' },
      { range: [69, 84], label: '高心理韧性', color: '#66BB6A' },
      { range: [85, 100], label: '极高心理韧性', color: '#8A2BE2' },
    ],
  },
  life_satisfaction: {
    name: '生活满意度量表',
    shortName: 'SAT',
    levels: [
      { range: [20, 36], label: '非常不满意', color: '#D32F2F' },
      { range: [37, 52], label: '有些不满意', color: '#FF6B6B' },
      { range: [53, 68], label: '基本满意', color: '#FFA726' },
      { range: [69, 84], label: '相当满意', color: '#66BB6A' },
      { range: [85, 100], label: '非常满意', color: '#8A2BE2' },
    ],
  },
  leadership_potential: {
    name: '领导力潜力测评',
    shortName: 'LD',
    levels: [
      { range: [20, 36], label: '基础潜力', color: '#FF6B6B' },
      { range: [37, 52], label: '发展中的潜力', color: '#FFA726' },
      { range: [53, 68], label: '中等潜力', color: '#42A5F5' },
      { range: [69, 84], label: '高领导潜力', color: '#66BB6A' },
      { range: [85, 100], label: '杰出领导潜力', color: '#8A2BE2' },
    ],
  },
  multiple_intelligences: {
    name: '多元智能测试',
    shortName: 'MI',
    levels: [
      { range: [20, 36], label: '智能发展基础期', color: '#FF6B6B' },
      { range: [37, 52], label: '智能发展探索期', color: '#FFA726' },
      { range: [53, 68], label: '平衡发展状态', color: '#42A5F5' },
      { range: [69, 84], label: '优势发展状态', color: '#66BB6A' },
      { range: [85, 100], label: '高度发展状态', color: '#8A2BE2' },
    ],
  },
} as const;

type TestTypeKey = keyof typeof testData;

function pickActiveLevel(
  levels: { range: [number, number]; label: string; color: string }[],
  score: number,
) {
  for (const lv of levels) {
    const [min, max] = lv.range;
    if (score >= min && score <= max) return lv;
  }
  return levels[0] ?? null;
}

function SectionTitle(props: { text: string; accent: string }) {
  return (
    <div className="mb-5">
      <div className="text-xl font-semibold border-b border-muted pb-3 relative">
        {props.text}
      </div>
      <div
        className="mt-2 h-[3px] w-14 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${props.accent} 0%, rgba(0,0,0,0) 100%)`,
        }}
      />
    </div>
  );
}

export default function ScaleTestReportPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { language, t: appT } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const tScaleTestReport = appT.scaleTestReport;

  // ✅ 本页新增文案：按你要求“用的时候 t.label1 就可以”
  const t = appT.scaleTestReport;

  const [result, setResult] = useState<any>(null);
  const [scoringRule, setScoringRule] = useState<ScaleScoringRule | null>(null);
  const [testConfig, setTestConfig] = useState<ScaleTestConfig | null>(null);
  const [allLevels, setAllLevels] = useState<ScaleScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId, user, language]);

  const loadReport = async () => {
    if (!resultId) return;
    try {
      setLoading(true);

      const testResult = await getScaleTestResultById(resultId);
      if (!testResult) throw new Error(tScaleTestReport.errNoResult);
      if (testResult.user_id !== user?.id) throw new Error(tScaleTestReport.errNoPermission);
      setResult(testResult);

      const rule = await getScaleScoringRuleByScore(testResult.test_type, testResult.iq_score);
      setScoringRule(rule);

      const config = await getScaleTestConfig(testResult.test_type);
      setTestConfig(config);

      const levels = await getScaleScoringRules(testResult.test_type);
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
    const title = testConfig?.name[language] || tScaleTestReport.shareTitleFallback;
    const text = tScaleTestReport.shareText(result?.iq_score, scoringRule?.label[language]);

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

  const computed = useMemo(() => {
    if (!result || !scoringRule || !testConfig) return null;

    const totalScore = clamp(Number(result.iq_score ?? 0), 0, 100);
    const percentile = clamp(Number(result.dimension_scores?.percentile ?? 50), 0, 100);
    const completedAt = new Date(result.completed_at || Date.now());
    const dateText = formatDateYYYYMMDD(completedAt);

    const maxScore = 100;

    const def = testData[result.test_type as TestTypeKey];
    const fallbackShortName = (result.test_type || '').toUpperCase();
    // console.log(def)
    const shortName = def?.shortName ?? fallbackShortName;
    const defLevels = def?.levels;

    const activeDefLevel = defLevels ? pickActiveLevel(defLevels, totalScore) : null;

    const levelCount = defLevels?.length ?? allLevels.length ?? 0;

    // 用于“分类高亮”展示：优先用你给的 testData.levels，否则回退 allLevels
    const displayLevels =
      defLevels?.map((lv) => ({
        key: `${lv.label}-${lv.range[0]}-${lv.range[1]}`,
        label: lv.label,
        color: lv.color,
        isActive: !!activeDefLevel && activeDefLevel.label === lv.label,
        rangeText: `${lv.range[0]}-${lv.range[1]}`,
      })) ??
      allLevels.map((lv) => ({
        key: String(lv.level),
        label: lv.label[language] ?? lv.label['en-US'] ?? String(lv.level),
        color: lv.color,
        isActive: lv.level === scoringRule.level,
        rangeText: '',
      }));

    return {
      totalScore,
      percentile,
      completedAt,
      dateText,
      maxScore,
      shortName,
      levelCount,
      displayLevels,
    };
  }, [result, scoringRule, testConfig, allLevels, language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !scoringRule || !testConfig || !computed) {
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

  const accent = scoringRule.color;
  const titleText = testConfig.name[language] || testConfig.name['en-US'] || '';
  const subtitleText = tScaleTestReport.scientificSubtitle;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10 px-4 print:bg-white">
      <div className="container mx-auto max-w-5xl">
        {/* ✅ 1. 标题区：参考 ResultPage（标题 + 副标题 + 结果标题） */}
        <div className="rounded-2xl overflow-hidden shadow-xl mb-8 print:shadow-none">
          <div
            className="relative px-8 py-10 text-white"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, rgba(45,42,85,1) 100%)`,
            }}
          >
            <div className="absolute right-6 top-2 text-[140px] font-extrabold opacity-10 select-none pointer-events-none leading-none">
              {computed.shortName}
            </div>

            <div className="relative">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{titleText}</h1>
              <p className="mt-2 text-white/80">{subtitleText}</p>

              <div
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full font-semibold shadow-sm"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  color: '#2d2a55',
                }}
              >
                <span className="text-sm opacity-80">{t.headerResultTitle}</span>
                <span className="text-base" style={{ color: accent }}>
                  {scoringRule.label[language]}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ 2. Meta 区：测试总分 / 人群百分位 / 等级（共X级） / 测试日期 */}
          <div className="bg-muted/40 border-t border-muted px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="rounded-xl bg-background/70 border border-muted px-4 py-4">
                <div className="text-2xl font-extrabold">{computed.totalScore}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.metaTotalScore}
                  <span className="ml-1 opacity-70">{tScaleTestReport.fullScore(computed.maxScore)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-background/70 border border-muted px-4 py-4">
                <div className="text-2xl font-extrabold" style={{ color: accent }}>
                  {computed.percentile}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t.metaPercentile}</div>
              </div>

              <div className="rounded-xl bg-background/70 border border-muted px-4 py-4">
                <div className="text-xl font-extrabold" style={{ color: accent }}>
                  {scoringRule.label[language]}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {applyTemplate(t.metaLevelWithTotal, { n: computed.levelCount })}
                </div>
              </div>

              <div className="rounded-xl bg-background/70 border border-muted px-4 py-4">
                <div className="text-xl font-bold">{computed.dateText}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.metaTestDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 3. 分类区：不要 progress bar，只展示分类高亮（参考定义） */}
        <Card className="mb-8 shadow-sm print:shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              <SectionTitle text={t.sectionLevels} accent={accent} />
            </CardTitle>
          </CardHeader>

          <CardContent className="-mt-8">
            {/* 5 个分类：均匀铺满 */}
            <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {computed.displayLevels.map((lv) => {
                const active = lv.isActive;

                return (
                  <div key={lv.key} className="flex flex-col items-center gap-2">
                    {/* pill：占满该列宽度 */}
                    <div
                      className="w-full px-3 py-2 rounded-full border text-sm text-center transition"
                      style={{
                        borderColor: active ? lv.color : 'rgba(0,0,0,0.10)',
                        background: active ? `${lv.color}18` : 'transparent',
                        color: active ? lv.color : 'rgba(0,0,0,0.65)',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {lv.label}
                    </div>

                    {/* 分数范围 */}
                    <div className="text-xs text-muted-foreground">
                      {lv.rangeText ? `${lv.rangeText}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              {tScaleTestReport.yourScore(
                computed.totalScore,
                ((computed.totalScore / computed.maxScore) * 100).toFixed(1),
              )}
            </div>
          </CardContent>

        </Card>

        {/* 概览 / Overview（标题样式对齐 ResultPage 的“Section Title + 内容块”语义） */}
        <Card className="mb-8 shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              <SectionTitle text={tScaleTestReport.overview} accent={accent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {tScaleTestReport.overviewP1(titleText)}
              <span className="font-bold mx-1" style={{ color: accent }}>
                {scoringRule.label[language]}
              </span>
              {tScaleTestReport.overviewP1_2(computed.percentile)}
            </p>
            <p className="text-muted-foreground leading-relaxed">{tScaleTestReport.overviewP2}</p>
          </CardContent>
        </Card>

        {/* 分数解读 / Interpretation */}
        <Card className="mb-8 shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              <SectionTitle text={tScaleTestReport.interpretationTitle} accent={accent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-8">
            <div className="mb-4 p-4 rounded-xl border" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}10` }}>
              <div className="font-semibold text-lg mb-2" style={{ color: accent }}>
                {scoringRule.label[language]}
              </div>
              <p className="text-muted-foreground leading-relaxed">{scoringRule.interpretation[language]}</p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl border border-muted">
              <div className="font-semibold mb-2">{tScaleTestReport.personalizedFeedback}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{scoringRule.feedback[language]}</p>
            </div>
          </CardContent>
        </Card>

        {/* ✅ 5. 能力维度分析：一行四个方块，百分比更大，下面放指标名称 */}
        {scoringRule.ability_dimensions?.[language] && (
          <Card className="mb-8 shadow-sm print:shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                <SectionTitle text={tScaleTestReport.abilityDim} accent={accent} />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(scoringRule.ability_dimensions[language]).map(([dimension, score]) => (
                  <div
                    key={dimension}
                    className="rounded-2xl border border-muted bg-background/60 px-4 py-5 text-center"
                  >
                    <div className="text-4xl font-extrabold leading-none" style={{ color: accent }}>
                      {Number(score)}%
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">{dimension}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 建议与行动指南 / Recommendations */}
        <Card className="mb-8 shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              <SectionTitle text={tScaleTestReport.adviceTitle} accent={accent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-8">
            <div className="space-y-6">
              <div>
                <div className="font-semibold mb-3">{tScaleTestReport.improvementAdvice}</div>
                <ul className="space-y-2">
                  {testConfig.recommendations[language].map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2" style={{ color: accent }}>
                        •
                      </span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold mb-3">{tScaleTestReport.plan30}</div>
                <ul className="space-y-2">
                  {testConfig.action_plan[language].map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 font-semibold" style={{ color: accent }}>
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
          className="mb-8 shadow-sm print:shadow-none"
          style={{
            background: `linear-gradient(135deg, ${accent}10, ${accent}05)`,
          }}
        >
          <CardContent className="p-8 text-center">
            <Award className="h-16 w-16 mx-auto mb-4" style={{ color: accent }} />
            <h3 className="text-2xl font-bold mb-2">{tScaleTestReport.certificate}</h3>
            <p className="text-muted-foreground mb-4">
              {tScaleTestReport.certP1(titleText)}
              <span className="font-bold mx-1" style={{ color: accent }}>
                {scoringRule.label[language]}
              </span>
              {tScaleTestReport.certP1_2(titleText, computed.totalScore)}
            </p>
            <p className="text-sm text-muted-foreground">{tScaleTestReport.certP2(computed.percentile)}</p>
            <p className="text-xs text-muted-foreground mt-4">{tScaleTestReport.certNote}</p>
          </CardContent>
        </Card>

        {/* 操作按钮 / Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-8 print:hidden">
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
        <Card className="bg-muted/30 shadow-sm print:shadow-none">
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
