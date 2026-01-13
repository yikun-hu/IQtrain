import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLatestTestResult } from '@/db/api';
import type { TestResult } from '@/types/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import iqTable from '@/components/result/iqtable';

type Lang = 'zh-CN' | 'en-US';
type I18nText = Record<string, string | undefined>;

type IqLevelConfig = {
  id: number;
  name: I18nText;
  iqRange: [number, number];
  percentile: I18nText;
  descriptionShort?: I18nText;
  colors: {
    headerGradient: string;
    accent: string;
    accentDark: string;
    badgeText: string;
    badgeGradient: string;
  };
  reportTitle?: I18nText;
  overview: {
    leadTemplate: I18nText;
    body: I18nText;
  };
  cognitiveProfile: {
    patternRecognition: number;
    spatialReasoning: number;
    logicalDeduction: number;
    processingSpeed: number;
  };
  cognitiveLabels: { key: keyof IqLevelConfig['cognitiveProfile']; label: I18nText }[];
  comparativeAnalysis: I18nText;
  chart: {
    type: string;
    bars: Array<
      | { label: I18nText; heightPct: number; color: string }
      | { labelTemplate: I18nText; heightPct: number; colorFrom: string }
    >;
    note: I18nText;
  };
  strengths: { title: I18nText; detail: I18nText }[];
  recommendations: { title: I18nText; detail: I18nText }[];
  trainingPlan: {
    title: I18nText;
    intro: I18nText;
    items: Array<I18nText>;
    style?: { backgroundColor?: string; radius?: number; padding?: number };
  };
  certificate: {
    titleTemplate: I18nText;
    paragraphs: Array<I18nText>;
    idTemplate?: string;
    dateLineTemplate?: I18nText;
    footnote?: I18nText;
  };
};

type IqTableConfig = {
  rendering: {
    titleTemplate: I18nText;
    header: {
      watermarkText: I18nText;
      title: I18nText;
      subtitle: I18nText;
    };
    meta: {
      items: Array<{
        key: string;
        label: I18nText;
        valueFrom: string;
      }>;
    };
    sectionsOrder: string[];
  };
  computedDefaults: {
    accuracyByLevelId: Record<string, number>;
    report: { idTemplate: string; seqDefault: string; version: string };
  };
  theme: {
    page: {
      backgroundColor: string;
      textColor: string;
      lineHeight: number;
      fontFamily: string;
    };
    container: {
      maxWidth: number;
      backgroundColor: string;
      shadow: string;
    };
    header: {
      padding: string;
      watermark: { fontSize: number; opacity: number; top: number; right: number };
    };
    badge: {
      padding: string;
      radius: number;
      fontSize: string;
      shadow: string;
      defaultGradient: string;
    };
    meta: {
      backgroundColor: string;
      borderColor: string;
      valueFontSize: string;
      labelFontSize: string;
    };
    section: {
      titleFontSize: string;
      titleUnderlineColor: string;
    };
    card: {
      backgroundColor: string;
      borderColor: string;
      radius: number;
    };
    lists: {
      itemBackgroundColor: string;
      itemPadding: string;
      itemRadius: string;
    };
    certificate: {
      borderWidth: number;
      radius: number;
      padding: number;
      background: string;
    };
    footer: {
      backgroundColor: string;
      borderColor: string;
      fontSize: string;
      textColor: string;
    };
    disclaimer: {
      backgroundColor: string;
      borderLeftColor: string;
      padding: number;
      radius: string;
    };
    responsive: {
      breakpoint: number;
      mobilePadding: string;
      cognitiveGridColumnsDesktop: number;
      cognitiveGridColumnsMobile: number;
    };
    print: { hidePrintButton: boolean; containerShadow: string };
  };
  levels: IqLevelConfig[];
  commonSections: {
    science: {
      title: I18nText;
      intro: I18nText;
      items: Array<{ title: I18nText; detail: I18nText }>;
    };
    disclaimer: {
      title: I18nText;
      items: Array<I18nText>;
    };
    footer: {
      copyright: I18nText;
      generatedAtTemplate: I18nText;
      reportIdTemplate: I18nText;
      miniDisclaimer: I18nText;
    };
    ui: {
      printButtonText: I18nText;
    };
  };
};

const TABLE = iqTable as unknown as IqTableConfig;

// ---------- helpers ----------
function pickLang(appLang: string): Lang {
  return appLang === 'zh' ? 'zh-CN' : 'en-US';
}
function t(map: I18nText | undefined, lang: Lang, fallback = ''): string {
  if (!map) return fallback;
  return (map[lang] ?? map['zh-CN'] ?? map['en-US'] ?? fallback) as string;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function applyTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? '' : String(v);
  });
}
function safeHtml(html: string) {
  // content from local iqtable.ts
  return { __html: html };
}
function selectLevelByIq(levels: IqLevelConfig[], iq: number): IqLevelConfig | null {
  for (const lv of levels) {
    const [min, max] = lv.iqRange;
    if (iq >= min && iq <= max) {
      return lv;
    }
  }
  return null;
}
function formatDateYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatDateCN(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}
function formatDateTime(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  const ss = `${d.getSeconds()}`.padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

// ---------- component ----------
export default function ResultPage() {
  const { language } = useLanguage();
  const lang = useMemo(() => pickLang(language), [language]);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    void loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    // 当页面加载或结果获取完成时，滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [result]);

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

  const handlePrintReport = () => window.print();

  // loading screen (simple, matches HTML feel)
  if (authLoading || loading) {
    return (
      <div className="iqr-page">
        <style>{css}</style>
        <div className="iqr-loading">
          <div className="iqr-spinner" />
          <div className="iqr-loading-text">{lang === 'zh-CN' ? '报告生成中…' : 'Generating report…'}</div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  // compute from data + iqtable.ts
  const iq = clamp(Number(result.iq_score ?? 0), 0, 200);
  const level = selectLevelByIq(TABLE.levels, iq) ?? TABLE.levels[0];

  const completedAt = new Date(result.completed_at || Date.now());
  const testDateText = formatDateYYYYMMDD(completedAt);
  const testDateCN = formatDateCN(completedAt);
  const generatedAt = formatDateTime(new Date());

  const seq = TABLE.computedDefaults.report.seqDefault ?? '001';
  const reportVersion = TABLE.computedDefaults.report.version ?? '2.1';
  const reportId = applyTemplate(TABLE.computedDefaults.report.idTemplate, {
    seq,
    YYYY: completedAt.getFullYear(),
    iq,
  });

  const accuracyValue =
    (typeof result.score === 'number' ? result.score : undefined) ??
    TABLE.computedDefaults.accuracyByLevelId[String(level.id)] ??
    0;
  const accuracyText = `${accuracyValue}%`;

  const documentTitle = applyTemplate(t(TABLE.rendering.titleTemplate, lang, ''), {
    levelName: t(level.name, lang, ''),
  });

  const metaItems = TABLE.rendering.meta.items.map((it) => {
    let value = '';
    switch (it.valueFrom) {
      case 'score.iq':
        value = String(iq);
        break;
      case 'level.percentile':
        value = t(level.percentile, lang, '');
        break;
      case 'computed.accuracyText':
        value = accuracyText;
        break;
      case 'computed.testDateText':
        value = testDateText;
        break;
      default:
        value = '';
    }
    return { key: it.key, label: t(it.label, lang, ''), value };
  });

  const overviewLeadHtml = applyTemplate(t(level.overview.leadTemplate, lang, ''), {
    levelName: t(level.name, lang, ''),
    iqMin: level.iqRange?.[0],
    percentile: t(level.percentile, lang, ''),
  });

  const badgeText =
    `${t(level.name, lang, '')}${lang === 'zh-CN' ? '级别' : ' Level'}` +
    (level.descriptionShort ? ` (${t(level.descriptionShort, lang, '')})` : '');

  const chartBars = level.chart?.bars ?? [];
  const accent = level.colors?.accent ?? '#8A2BE2';

  return (
    <div className="iqr-page">
      <style>{css}</style>
      <title>{documentTitle}</title>

      <div className="report-container">
        <div
          className="report-header"
          style={{
            background: level.colors?.headerGradient ?? 'linear-gradient(135deg, #8A2BE2 0%, #5D0C9D 100%)',
          }}
        >
          <div className="header-watermark">
            {t(TABLE.rendering.header.watermarkText, lang, 'MENSA')}
          </div>
          <h1 className="report-title">{t(TABLE.rendering.header.title, lang, '')}</h1>
          <p className="report-subtitle">{t(TABLE.rendering.header.subtitle, lang, '')}</p>
          <div
            className="level-badge"
            style={{
              background: level.colors?.badgeGradient ?? TABLE.theme.badge.defaultGradient,
              color: level.colors?.badgeText ?? '#5D0C9D',
            }}
          >
            {badgeText}
          </div>
        </div>

        <div className="report-meta">
          {metaItems.map((m) => (
            <div key={m.key} className="meta-item">
              <div className="meta-value" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
                {m.value}
              </div>
              <div className="meta-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="report-body">
          {/* Overview */}
          <div className="section">
            <h2
              className="section-title"
              style={{
                color: level.colors?.accentDark ?? '#5D0C9D',
                borderBottomColor: TABLE.theme.section.titleUnderlineColor,
              }}
            >
              {lang === 'zh-CN' ? '报告概览' : 'Report Overview'}
            </h2>

            <p dangerouslySetInnerHTML={safeHtml(overviewLeadHtml)} />
            <p>{t(level.overview.body, lang, '')}</p>

            {/* <div className="center-block">
              <button
                type="button"
                className="print-button"
                onClick={handlePrintReport}
                style={{
                  background:
                    level.colors?.headerGradient ?? 'linear-gradient(135deg, #8A2BE2 0%, #5D0C9D 100%)',
                }}
              >
                {t(TABLE.commonSections.ui.printButtonText, lang, lang === 'zh-CN' ? '打印本报告' : 'Print This Report')}
              </button>
            </div> */}
          </div>

          {/* Cognitive Profile + Comparison */}
          <div className="section">
            <h2 className="section-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {lang === 'zh-CN' ? '认知能力剖面分析' : 'Cognitive Ability Profile Analysis'}
            </h2>

            <p>
              {lang === 'zh-CN'
                ? '以下是根据您的测试表现分析出的各项认知能力指标：'
                : 'The following indicators are analyzed based on your performance:'}
            </p>

            <div className="cognitive-grid">
              {level.cognitiveLabels.map((item) => {
                const v = level.cognitiveProfile[item.key];
                return (
                  <div key={String(item.key)} className="cognitive-card">
                    <div className="cognitive-value" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
                      {v}%
                    </div>
                    <div className="cognitive-label">{t(item.label, lang, '')}</div>
                  </div>
                );
              })}
            </div>

            <div className="comparison-container">
              <h3 className="text-center font-bold">{lang === 'zh-CN' ? '与人群对比分析' : 'Comparison with Population'}</h3>
              <p>{t(level.comparativeAnalysis, lang, '')}</p>

              <div className="chart-container" aria-label="comparison chart">
                {chartBars.map((bar, idx) => {
                  const leftPct = 10 + idx * 20; // mimic HTML demo
                  const widthPct = 15;
                  const heightPct = 'heightPct' in bar ? bar.heightPct : 60;

                  const barColor =
                    'color' in bar
                      ? bar.color
                      : accent;

                  const label =
                    'label' in bar
                      ? t(bar.label, lang, '')
                      : applyTemplate(t(bar.labelTemplate, lang, ''), {
                          percentile: t(level.percentile, lang, ''),
                        });

                  const isYou = idx === chartBars.length - 1;

                  return (
                    <div key={idx}>
                      <div
                        className="chart-bar"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                          backgroundColor: barColor,
                        }}
                      />
                      <div
                        className={`chart-label ${isYou ? 'is-you' : ''}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p>
                <strong>{lang === 'zh-CN' ? '解读：' : 'Interpretation: '}</strong>
                {t(level.chart.note, lang, '')}
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div className="section">
            <h2 className="section-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {lang === 'zh-CN' ? '认知优势分析' : 'Cognitive Strength Analysis'}
            </h2>

            <p>{lang === 'zh-CN' ? '基于测试结果，我们识别出您的以下认知优势：' : 'Based on the results, your strengths include:'}</p>

            <ul className="strength-list">
              {level.strengths.map((s, i) => (
                <li key={i} style={{ borderLeftColor: accent }}>
                  <strong>{t(s.title, lang, '')}：</strong> {t(s.detail, lang, '')}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations + Training Plan */}
          <div className="section">
            <h2 className="section-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {lang === 'zh-CN' ? '发展建议与规划' : 'Development Suggestions and Planning'}
            </h2>

            <p>{lang === 'zh-CN' ? '基于您的认知特点，我们为您制定以下发展计划：' : 'Based on your profile, we suggest:'}</p>

            <ul className="recommendation-list">
              {level.recommendations.map((r, i) => (
                <li key={i} style={{ borderLeftColor: accent }}>
                  <strong>{t(r.title, lang, '')}：</strong> {t(r.detail, lang, '')}
                </li>
              ))}
            </ul>

            
            <h2 className="section-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {t(level.trainingPlan.title, lang, '')}
            </h2>

            <p>{t(level.trainingPlan.intro, lang, '')}</p>

            <ul className="recommendation-list">
              {level.trainingPlan.items.map((it, i) => (
                <li key={i} style={{ borderLeftColor: accent }}>
                  {t(it, lang, '')}
                </li>
              ))}
            </ul>
            {/* <div
              className="training-plan"
              style={{
                backgroundColor: level.trainingPlan.style?.backgroundColor ?? '#f0f8ff',
                borderRadius: level.trainingPlan.style?.radius ?? 8,
                padding: level.trainingPlan.style?.padding ?? 20,
              }}
            >
              <ol>
                {level.trainingPlan.items.map((it, idx) => (
                  <li key={idx}>{t(it, lang, '')}</li>
                ))}
              </ol>
            </div> */}
          </div>

          {/* Certificate */}
          <div className="certificate" style={{ borderColor: accent }}>
            <div className="certificate-bg" />
            <h3 className="certificate-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {applyTemplate(t(level.certificate.titleTemplate, lang, ''), {
                levelReportTitle: t(level.reportTitle, lang, t(level.name, lang, '')),
              })}
            </h3>

            {level.certificate.paragraphs.map((p, idx) => {
              const html = applyTemplate(t(p, lang, ''), {
                levelName: t(level.name, lang, ''),
                percentile: t(level.percentile, lang, ''),
                iq,
              });
              return <p key={idx} dangerouslySetInnerHTML={safeHtml(html)} />;
            })}

            <div className="certificate-id">
              {lang === 'zh-CN' ? '证书编号: ' : 'Certificate Number: '}
              {applyTemplate(level.certificate.idTemplate ?? reportId, {
                YYYY: completedAt.getFullYear(),
                iq,
                seq,
              }) || reportId}
            </div>

            <p>
              {applyTemplate(t(level.certificate.dateLineTemplate, lang, ''), {
                testDateCN,
              })}
            </p>

            <p className="certificate-footnote">{t(level.certificate.footnote, lang, '')}</p>
          </div>

          {/* Science */}
          <div className="section">
            <h2 className="section-title" style={{ color: level.colors?.accentDark ?? '#5D0C9D' }}>
              {t(TABLE.commonSections.science.title, lang, '')}
            </h2>
            <p>{t(TABLE.commonSections.science.intro, lang, '')}</p>
            <ul>
              {TABLE.commonSections.science.items.map((it, i) => (
                <li key={i}>
                  <strong>{t(it.title, lang, '')}：</strong> {t(it.detail, lang, '')}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <h3>{t(TABLE.commonSections.disclaimer.title, lang, '')}</h3>
            {TABLE.commonSections.disclaimer.items.map((it, i) => (
              <p key={i}>
                {i + 1}. {t(it, lang, '')}
              </p>
            ))}
          </div>
        </div>

        <div className="footer">
          <p>
            {t(TABLE.commonSections.footer.copyright, lang, '')} |{' '}
            {applyTemplate(t(TABLE.commonSections.footer.generatedAtTemplate, lang, ''), { generatedAt })}
          </p>
          <p>
            {applyTemplate(t(TABLE.commonSections.footer.reportIdTemplate, lang, ''), {
              reportId,
              reportVersion,
            })}
          </p>
          <p className="footer-mini">{t(TABLE.commonSections.footer.miniDisclaimer, lang, '')}</p>
        </div>
      </div>

      {/* bottom actions (match HTML style; no shadcn ui) */}
      <div className="iqr-actions">
        <button className="iqr-action secondary" onClick={() => navigate('/dashboard')}>
          {language === 'zh' ? '返回仪表盘' : 'Back to Dashboard'}
        </button>

        <button
          className="iqr-action primary"
          onClick={handlePrintReport}
          style={{
            background:
              level.colors?.headerGradient ?? 'linear-gradient(135deg, #8A2BE2 0%, #5D0C9D 100%)',
          }}
        >
          {language === 'zh' ? '打印报告' : 'Print Report'}
        </button>

        <button
          className="iqr-action dark"
          onClick={() =>
            toast({
              title: language === 'zh' ? '提示' : 'Tip',
              description: language === 'zh' ? '下载功能开发中' : 'Download function in development',
            })
          }
        >
          {language === 'zh' ? '下载报告' : 'Download Report'}
        </button>
      </div>
    </div>
  );
}

const css = `
/* Match the provided iq-result.html look & feel */
.iqr-page{
  box-sizing:border-box;
  font-family:'Segoe UI','Microsoft YaHei',sans-serif;
  background:#f5f7ff;
  color:#333;
  line-height:1.7;
  margin:0;
  padding:0;
  min-height:100vh;
}
.iqr-page *{ box-sizing:border-box; font-family:inherit; }

.report-container{
  max-width:1000px;
  margin:0 auto;
  background:#fff;
  box-shadow:0 0 30px rgba(0,0,0,.08);
  position:relative;
  overflow:hidden;
}

.report-header{
  color:#fff;
  padding:40px 50px 30px;
  position:relative;
}
.header-watermark{
  position:absolute;
  font-size:180px;
  font-weight:800;
  opacity:.1;
  top:-30px;
  right:30px;
  color:#fff;
  line-height:1;
  user-select:none;
  pointer-events:none;
}
.report-title{
  margin:0;
  font-size:2.5rem;
  font-weight:300;
  letter-spacing:1px;
}
.report-subtitle{
  margin:10px 0 0;
  font-size:1.2rem;
  font-weight:300;
  opacity:.9;
}
.level-badge{
  display:inline-block;
  padding:8px 25px;
  border-radius:50px;
  font-weight:800;
  font-size:1.3rem;
  margin-top:15px;
  box-shadow:0 4px 15px rgba(0,0,0,.2);
}

.report-meta{
  display:flex;
  justify-content:space-between;
  background:#f0f0ff;
  padding:20px 50px;
  border-bottom:1px solid #e0e0ff;
  gap:20px;
  flex-wrap:wrap;
}
.meta-item{ text-align:center; flex:1 1 160px; }
.meta-value{ font-size:1.8rem; font-weight:800; }
.meta-label{ font-size:.9rem; color:#666; margin-top:5px; }

.report-body{ padding:40px 50px; }

.section{
  margin-bottom:50px;
  page-break-inside:avoid;
  break-inside:avoid;
}

.section-title{
  border-bottom:2px solid #e0e0ff;
  padding-bottom:10px;
  margin-top:0;
  margin-bottom:25px;
  font-size:1.6rem;
  position:relative;
}
.section-title:after{
  content:'';
  position:absolute;
  width:60px;
  height:3px;
  background:linear-gradient(90deg,#8A2BE2 0%, #5D0C9D 100%);
  bottom:-2px;
  left:0;
}

.center-block{ text-align:center; margin:30px 0; }

.print-button{
  color:#fff;
  border:none;
  padding:12px 30px;
  border-radius:50px;
  font-size:1rem;
  cursor:pointer;
  margin:20px 0;
  transition:transform .25s, box-shadow .25s;
}
.print-button:hover{
  transform:translateY(-2px);
  box-shadow:0 5px 15px rgba(138,43,226,.3);
}

.cognitive-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;
  margin:30px 0;
}
.cognitive-card{
  background:#f8f9ff;
  border-radius:10px;
  padding:20px;
  text-align:center;
  border:1px solid #e0e0ff;
  transition:transform .3s, box-shadow .3s;
}
.cognitive-card:hover{
  transform:translateY(-5px);
  box-shadow:0 10px 20px rgba(138,43,226,.1);
}
.cognitive-value{
  font-size:2.2rem;
  font-weight:900;
  margin-bottom:10px;
}
.cognitive-label{ font-size:1rem; color:#666; }

.strength-list,.recommendation-list{ list-style:none; padding:0; margin:0; }
.strength-list li,.recommendation-list li{
  padding:12px 20px;
  margin-bottom:12px;
  background:#f8f9ff;
  border-left:4px solid #8A2BE2;
  border-radius:0 8px 8px 0;
}

.comparison-container{
  background:#f8f9ff;
  border-radius:10px;
  padding:30px;
  margin:30px 0;
}
.chart-container{
  height:200px;
  background:linear-gradient(to top,#f0f0ff, #fff);
  border-radius:8px;
  margin:25px 0 35px;
  position:relative;
  overflow:hidden;
  border:1px solid #e0e0ff;
}
.chart-bar{
  position:absolute;
  bottom:0;
  border-radius:4px 4px 0 0;
}
.chart-label{
  position:absolute;
  bottom:-25px;
  text-align:center;
  font-size:.8rem;
}
.chart-label.is-you{ font-weight:800; }

.training-plan h3{ margin-top:0; }

.certificate{
  border:3px solid #8A2BE2;
  border-radius:15px;
  padding:40px;
  text-align:center;
  background:linear-gradient(to bottom,#f8f5ff, #fff);
  margin:40px 0;
  position:relative;
  overflow:hidden;
}
.certificate-bg{
  position:absolute;
  inset:0;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><path d='M20,20 L80,20 L80,80 L20,80 Z' fill='none' stroke='%238A2BE2' stroke-width='1' opacity='0.1'/><circle cx='50' cy='50' r='20' fill='none' stroke='%238A2BE2' stroke-width='1' opacity='0.1'/></svg>");
  background-size:100px;
  opacity:.3;
  pointer-events:none;
}
.certificate > *{ position:relative; }
.certificate-title{
  font-size:2.2rem;
  margin-top:0;
}
.certificate-id{
  font-family:'Courier New',monospace;
  background:#f0f0ff;
  padding:15px;
  border-radius:8px;
  margin:20px 0;
  font-size:1.1rem;
  display:inline-block;
}
.certificate-footnote{
  margin-top:20px;
  font-style:italic;
}

.disclaimer{
  background:#fff5f5;
  border-left:4px solid #ff6b6b;
  padding:20px;
  margin:30px 0;
  border-radius:0 8px 8px 0;
}
.footer{
  background:#f0f0ff;
  padding:30px 50px;
  text-align:center;
  border-top:1px solid #e0e0ff;
  font-size:.9rem;
  color:#666;
}
.footer-mini{ margin-top:15px; font-size:.8rem; }

.iqr-actions{
  max-width:1000px;
  margin:18px auto 40px;
  padding:0 14px;
  display:flex;
  gap:12px;
  justify-content:center;
  flex-wrap:wrap;
}
.iqr-action{
  border:none;
  padding:12px 18px;
  border-radius:999px;
  cursor:pointer;
  font-size:1rem;
  transition:transform .2s, box-shadow .2s, background .2s;
}
.iqr-action:hover{ transform:translateY(-2px); box-shadow:0 8px 18px rgba(0,0,0,.12); }
.iqr-action.secondary{
  background:#fff;
  border:1px solid #e0e0ff;
  color:#333;
}
.iqr-action.primary{
  color:#fff;
}
.iqr-action.dark{
  background:#2d2a55;
  color:#fff;
}
.iqr-action.dark:hover{ background:#241f45; }

/* Loading */
.iqr-loading{
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:14px;
}
.iqr-spinner{
  width:46px; height:46px;
  border-radius:50%;
  border:4px solid rgba(93,12,157,.18);
  border-top-color: rgba(93,12,157,.95);
  animation:iqrspin 1s linear infinite;
}
@keyframes iqrspin{ to{ transform:rotate(360deg); } }
.iqr-loading-text{ color:#5D0C9D; font-weight:600; }

/* Print rules */
@media print{
  .iqr-page{ background:#fff; }
  .report-container{ box-shadow:none; max-width:100%; }
  .print-button, .iqr-actions{ display:none !important; }
}

/* Responsive */
@media (max-width: 768px){
  .report-header, .report-body, .report-meta, .footer{
    padding:30px 20px;
  }
  .report-title{ font-size:2rem; }
  .cognitive-grid{ grid-template-columns:repeat(2,1fr); }
  .report-meta{ flex-direction:column; gap:20px; }
}
`;