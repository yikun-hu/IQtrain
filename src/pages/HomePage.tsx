// HomePage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Star,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Timer,
  BadgeCheck,
  BarChart3,
  Activity,
  Crown,
  Microscope, ScanSearch, FileBarChart,
  BrainCircuit, Dumbbell, Puzzle,
} from 'lucide-react';

type Country = { name: string; code: string; iq: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Abramowitz and Stegun erf approximation
function erfApprox(x: number) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * ax);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);

  return sign * y;
}

function normalCdf(z: number) {
  return 0.5 * (1 + erfApprox(z / Math.SQRT2));
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const { t: allT } = useLanguage();
  const t: any = (allT as any).home ?? (allT as any);

  const navigate = useNavigate();

  // -------------------------
  // Countries marquee data (use provided list, shuffle, 1 decimal)
  // -------------------------
  const countries: Country[] = useMemo(
    () =>
      shuffle([
        { name: 'China', code: 'cn', iq: 107.19 },
        { name: 'South Korea', code: 'kr', iq: 106.43 },
        { name: 'Japan', code: 'jp', iq: 106.4 },
        { name: 'Iran', code: 'ir', iq: 106.3 },
        { name: 'Singapore', code: 'sg', iq: 105.14 },
        { name: 'Russia', code: 'ru', iq: 103.16 },
        { name: 'Mongolia', code: 'mn', iq: 102.86 },
        { name: 'Australia', code: 'au', iq: 102.57 },
        { name: 'Spain', code: 'es', iq: 102.3 },
        { name: 'New Zealand', code: 'nz', iq: 102.08 },
        { name: 'Canada', code: 'ca', iq: 101.65 },
        { name: 'France', code: 'fr', iq: 101.42 },
        { name: 'Italy', code: 'it', iq: 100.84 },
        { name: 'Switzerland', code: 'ch', iq: 100.75 },
        { name: 'Malaysia', code: 'my', iq: 100.48 },
        { name: 'Finland', code: 'fi', iq: 100.3 },
        { name: 'Vietnam', code: 'vn', iq: 100.12 },
        { name: 'Belgium', code: 'be', iq: 100.11 },
        { name: 'USA', code: 'us', iq: 99.74 },
        { name: 'Netherlands', code: 'nl', iq: 99.72 },
        { name: 'UK', code: 'gb', iq: 99.68 },
        { name: 'Austria', code: 'at', iq: 99.65 },
        { name: 'Germany', code: 'de', iq: 99.64 },
        { name: 'Poland', code: 'pl', iq: 99.35 },
        { name: 'India', code: 'in', iq: 99.08 },
        { name: 'Israel', code: 'il', iq: 99.07 },
        { name: 'Turkey', code: 'tr', iq: 99.07 },
        { name: 'Thailand', code: 'th', iq: 101.52 },
        { name: 'Slovenia', code: 'si', iq: 101.96 },
        { name: 'Brazil', code: 'br', iq: 87.0 },
        { name: 'Mexico', code: 'mx', iq: 88.0 },
      ]),
    [],
  );

  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const [pillPos, setPillPos] = useState<{ left: number; top: number } | null>(null);


  // -------------------------
  // Testimonials
  // -------------------------
  const testimonials = useMemo(() => {
    const list = t.testimonials?.customers ?? [];

    // 评分：混合 4 / 4.5 / 5（按你 6 条顺序）
    const ratings = [5, 4.5, 5, 4, 4.5, 5];

    return ratings.map((rating, i) => ({
      name: list[i]?.name ?? '',
      comment: list[i]?.comment ?? '',
      location: list[i]?.location ?? '',
      time: list[i]?.time ?? '',
      rating,
    }));
  }, [t]);
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => {
          const i = idx + 1;

          if (i <= full) {
            return <Star key={i} className="h-4 w-4 fill-current text-primary" />;
          }
          if (hasHalf && i === full + 1) {
            return <StarHalf key={i} className="h-4 w-4 fill-current text-primary" />;
          }
          return <Star key={i} className="h-4 w-4 text-muted-foreground/35" />;
        })}
      </div>
    );
  };


  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const visibleTestimonials = testimonials.slice(testimonialIndex, testimonialIndex + 3);

  const prevTestimonials = () =>
    setTestimonialIndex((v) => (v - 3 < 0 ? Math.max(0, testimonials.length - 3) : v - 3));
  const nextTestimonials = () =>
    setTestimonialIndex((v) => (v + 3 >= testimonials.length ? 0 : v + 3));

  // -------------------------
  // Hero interactive IQ curve + slider (FIXED pointer mismatch using SVG CTM)
  // -------------------------
  const [iq, setIq] = useState(100);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const iqMin = 55;
  const iqMax = 145;
  const mean = 100;
  const sd = 15;

  // Plot geometry in viewBox units
  const viewW = 600;
  const viewH = 260;
  const plotLeft = 18;
  const plotRight = 582;
  const baseY = 218;

  const iqToX = (v: number) => {
    const r = (v - iqMin) / (iqMax - iqMin);
    return plotLeft + r * (plotRight - plotLeft);
  };

  const xToIq = (x: number) => {
    const r = (x - plotLeft) / (plotRight - plotLeft);
    return iqMin + clamp(r, 0, 1) * (iqMax - iqMin);
  };

  const curveY = (xIq: number) => {
    const z = (xIq - mean) / sd;
    const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    const scale = 170;
    return baseY - pdf * scale * 2.2;
  };

  const percentile = useMemo(() => {
    const z = (iq - mean) / sd;
    return clamp(normalCdf(z) * 100, 0, 100);
  }, [iq]);

  const pathD = useMemo(() => {
    let d = '';
    for (let x = iqMin; x <= iqMax; x += 1) {
      const vx = iqToX(x);
      const vy = curveY(x);
      d += x === iqMin ? `M ${vx} ${vy}` : ` L ${vx} ${vy}`;
    }
    return d;
  }, []);

  const areaD = useMemo(() => {
    return `${pathD} L ${plotRight} ${baseY} L ${plotLeft} ${baseY} Z`;
  }, [pathD]);

  const markerX = useMemo(() => iqToX(iq), [iq]);

  const clientToSvgX = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const inv = ctm.inverse();
    const sp = pt.matrixTransform(inv);
    return sp.x;
  };

  const setIqFromPointer = (clientX: number, clientY: number) => {
    const x = clientToSvgX(clientX, clientY);
    if (x == null) return;
    // clamp to the real plot range so cursor aligns with point
    const clampedX = clamp(x, plotLeft, plotRight);
    const v = xToIq(clampedX);
    setIq(Math.round(v));
  };

  // -------------------------
  // Live bubble (fade + gradient name, NOT covering chart)
  // -------------------------
  const liveNames = useMemo(
    () => ['Sophia', 'Daniel', 'Ava', 'Lucas', 'Mia', 'Ethan', 'Liam', 'Olivia'],
    [],
  );
  const [live, setLive] = useState<{ name: string; score: number }>(() => ({
    name: liveNames[Math.floor(Math.random() * liveNames.length)],
    score: 95 + Math.floor(Math.random() * 45),
  }));
  const [liveFade, setLiveFade] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveFade(true);
      window.setTimeout(() => {
        setLive({
          name: liveNames[Math.floor(Math.random() * liveNames.length)],
          score: 95 + Math.floor(Math.random() * 45),
        });
        setLiveFade(false);
      }, 220);
    }, 4200);
    return () => window.clearInterval(id);
  }, [liveNames]);

  const updatePillPos = () => {
    const svg = svgRef.current;
    const wrap = chartWrapRef.current;
    if (!svg || !wrap) return;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    // 取曲线点坐标（SVG viewBox 坐标）
    const vx = markerX;
    const vy = curveY(iq);

    // 转为屏幕坐标
    const pt = svg.createSVGPoint();
    pt.x = vx;
    pt.y = vy;
    const sp = pt.matrixTransform(ctm);

    // 转为相对父容器坐标
    const wrapRect = wrap.getBoundingClientRect();
    setPillPos({
      left: sp.x - wrapRect.left,
      top: sp.y - wrapRect.top,
    });
  };

  useEffect(() => {
    updatePillPos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iq, markerX]); // markerX 由 iq 推导也可不写，但写上更保险

  useEffect(() => {
    const onResize = () => updatePillPos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {

    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [window.location.hash])


  // -------------------------
  // Sections data
  // -------------------------
  const methodCards = [
    { icon: Microscope, title: t.method1TitleShort, desc: t.method1DescShort },
    { icon: ScanSearch, title: t.method2TitleShort, desc: t.method2DescShort },
    { icon: FileBarChart, title: t.method3TitleShort, desc: t.method3DescShort },
    { icon: ShieldCheck, title: t.method4TitleShort, desc: t.method4DescShort },
  ];


  const services = [
    { icon: BrainCircuit, title: t.service1TitleShort, desc: t.service1DescShort }, // IQ
    { icon: Activity, title: t.service2TitleShort, desc: t.service2DescShort },     // Stress
    { icon: Crown, title: t.service3TitleShort, desc: t.service3DescShort },        // Leadership
    { icon: Dumbbell, title: t.service4TitleShort, desc: t.service4DescShort },     // Memory training
    { icon: Puzzle, title: t.service5TitleShort, desc: t.service5DescShort },       // Games
  ];


  const steps = [
    { icon: <Timer className="h-5 w-5" />, title: t.step2Title, desc: t.step2Desc },
    { icon: <BadgeCheck className="h-5 w-5" />, title: t.step3Title, desc: t.step3Desc },
    { icon: <UserPlus className="h-5 w-5" />, title: t.step1Title, desc: t.step1Desc },
    { icon: <BarChart3 className="h-5 w-5" />, title: t.step4Title, desc: t.step4Desc },
  ];

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes iqtrain-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Floating Start Test Button */}
      <Button
        onClick={() => navigate('/test')}
        className="fixed bottom-6 right-6 z-50 h-12 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
        size="lg"
        aria-label="Start Test"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5v14l11-7z"
          />
        </svg>
        <span className="text-sm font-medium">{t.startTest}</span>
      </Button>

      {/* HERO */}
      <section className="bg-muted/40">
        <div className="container mx-auto px-4 pt-8 pb-3 md:pt-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div className="max-w-xl">
              {/* <p className="text-sm font-medium text-muted-foreground">{t.heroKicker}</p> */}
              <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                <span className="text-foreground">{t.heroTitlePrefix}</span>{' '}
                <span id="country-iq" className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {t.heroTitleGradient}
                </span>
              </h1>

              <p className="mt-3 text-base text-muted-foreground md:text-lg">{t.heroSubtitle}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate('/test')}
                  className="bg-primary py-6 text-md font-bold hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                  size="lg"
                >
                  {t.heroCta}
                </Button>
                {/* <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('services');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-background hover:bg-background/90 border border-border text-foreground"
                >
                  {t.heroSecondaryCta}
                </Button> */}
              </div>

              {/* Social proof */}
              <div className="mt-5 flex items-center gap-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 5].map((n, idx) => (
                    <img
                      key={idx}
                      src={`/images/avatars/${n}.jpg`}
                      alt="user"
                      className="h-9 w-9 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-primary" />
                    ))}
                    <span className="ml-2 text-sm font-medium text-foreground">{t.socialProofTitle}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-gray-500 tabular-nums">{t.testsThisMonthNumber}</span>{' '}
                    {t.testsThisMonthText}
                  </p>

                </div>
              </div>
            </div>

            {/* Right: chart */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">{t.chartTitle}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.percentileLead.replace('{p}', percentile.toFixed(1)).replace('{iq}', String(iq))}
                    </p>
                  </div>

                  {/* Live bubble (outside plot area, never blocks) */}
                  <div
                    className={`shrink-0 rounded-full bg-background px-3 py-1 text-xs shadow-sm transition-opacity duration-200 ${liveFade ? 'opacity-0' : 'opacity-100'
                      }`}
                  >
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text font-semibold text-transparent">
                      {live.name}
                    </span>{' '}
                    <span className="text-muted-foreground">{t.liveScored.replace('{iq}', String(live.score))}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div ref={chartWrapRef} className="relative">
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${viewW} ${viewH}`}
                    className="h-48 w-full md:h-52"
                    preserveAspectRatio="xMidYMid meet"
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setIqFromPointer(e.clientX, e.clientY);
                    }}
                    onPointerMove={(e) => {
                      if ((e.buttons ?? 0) === 0) return;
                      setIqFromPointer(e.clientX, e.clientY);
                    }}
                    role="presentation"
                  >
                    <defs>
                      <linearGradient id="iqtrainFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* plot area */}
                    <path d={areaD} fill="url(#iqtrainFill)" />
                    <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />

                    {/* Ticks */}
                    {([55, 70, 85, 100, 115, 130, 145] as const).map((v) => {
                      const x = iqToX(v);
                      return (
                        <g key={v}>
                          <line x1={x} y1={baseY} x2={x} y2={24} stroke="hsl(var(--border))" strokeDasharray="4 6" />
                          <text x={x} y={248} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">
                            {v}
                          </text>
                        </g>
                      );
                    })}

                    {/* Marker */}
                    <line
                      x1={markerX}
                      y1={baseY}
                      x2={markerX}
                      y2={14}
                      stroke="hsl(var(--primary))"
                      strokeDasharray="6 6"
                      strokeOpacity="0.55"
                    />
                    <circle
                      cx={markerX}
                      cy={curveY(iq)}
                      r={7}
                      fill="hsl(var(--primary))"
                      stroke="white"
                      strokeWidth="3"
                    />

                    {/* precise hitbox = plot only (no “white blank” clicks) */}
                    <rect x={plotLeft} y={10} width={plotRight - plotLeft} height={baseY - 10} fill="transparent" />
                  </svg>

                  {/* IQ pill (pixel-accurate: always above the dot) */}
                  {pillPos && (
                    <div
                      className="pointer-events-none absolute z-10"
                      style={{
                        left: pillPos.left,
                        top: pillPos.top,
                        transform: 'translate(-50%, -100%)',
                        marginTop: -18, // 往上再抬一点：不盖住小圆点（可调 -14 ~ -26）
                      }}
                    >
                      <div className="relative">
                        <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                          IQ {iq}
                        </div>
                        <div
                          className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '8px solid hsl(var(--primary))',
                          }}
                        />
                      </div>
                    </div>
                  )}



                  {/* Slider */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ }</span>
                      <span>{t.dragHint}</span>
                      <span>{ }</span>
                    </div>
                    <input
                      type="range"
                      min={iqMin}
                      max={iqMax}
                      value={iq}
                      onChange={(e) => setIq(Number(e.target.value))}
                      className="mt-2 w-full accent-[hsl(var(--primary))]"
                      aria-label="IQ slider"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => navigate('/test')}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    size="lg"
                  >
                    {t.heroCta}
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">{t.heroTimeHint}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Countries marquee (bigger flags, 2-line text, more spacing, no per-item border, fix overflow) */}
        <div className="bg-background/60">
          <div className="container mx-auto px-4 py-3 mt-12">
            <div className="flex items-center justify-center gap-4">
              <p className="text-xl font-bold text-foreground">{t.countryStripTitle}</p>
              {/* <p className="hidden text-sm text-muted-foreground md:block">{t.countryStripHint}</p> */}
            </div>

            <div className="mt-2 overflow-hidden rounded-xl bg-background">
              <div className="relative">
                <div
                  className="flex w-[200%] items-center gap-8 py-2"
                  style={{ animation: 'iqtrain-marquee 28s linear infinite' }}
                >
                  {[...countries, ...countries].map((c, idx) => (
                    <div key={`${c.code}-${idx}`} className="mx-1 flex items-center gap-3">
                      <img
                        src={`https://flagcdn.com/w80/${c.code}.png`}
                        alt={c.name}
                        className="h-6 w-10 rounded-sm object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-[110px] max-w-[160px] overflow-hidden">
                        <div className="truncate text-sm font-medium text-foreground">{c.name}</div>
                        <div className="text-sm font-semibold tabular-nums text-primary">
                          {c.iq.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific method */}
      <section className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.methodSectionTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.methodSectionSub}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {methodCards.map((it, idx) => {
              const Icon = it.icon;
              return (
                <Card key={idx} className="shadow-sm">
                  <CardContent className="pt-7 pb-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>

                    <p className="mt-4 text-base font-semibold text-foreground">{it.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{it.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* Services (background a bit stronger) */}
      <section id="services" className="bg-muted/60 py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.servicesTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.servicesSub}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Card key={idx} className="shadow-sm">
                  <CardContent className="pt-7 pb-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>

                    <p className="mt-4 text-base font-semibold text-foreground">{s.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.testimonialTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.testimonialSub}</p>
          </div>

          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-3">
              {visibleTestimonials.map((r, idx) => {
                return (
                  <Card key={idx} className="shadow-sm">
                    <CardContent className="pt-0">
                      {/* comment */}
                      <p className="text-sm leading-6 text-muted-foreground">
                        “{r.comment}”
                      </p>

                      {/* name + stars (below comment) */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">{r.name}</p>
                        {renderStars(r.rating)}
                      </div>

                      {/* meta line */}
                      <p className="mt-2 text-xs text-muted-foreground">
                        -- {r.location} · {r.time}
                      </p>
                    </CardContent>
                  </Card>

                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full" onClick={prevTestimonials}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={nextTestimonials}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (light background, no button) */}
      <section id="how-it-works" className="bg-muted/40 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t.flowTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.flowSub}</p>
          </div>

          <div className="mt-12">
            {/* desktop */}
            <div className="relative mx-auto hidden max-w-6xl md:block">
              <div className="absolute left-10 right-10 top-6 h-px bg-border" />
              <div className="grid grid-cols-4 gap-8">
                {steps.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background ring-1 ring-border shadow-sm">
                      <div className="text-primary">{s.icon}</div>
                    </div>
                    <p className="mt-4 text-base font-semibold text-foreground">{s.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* mobile */}
            <div className="mx-auto grid max-w-xl gap-4 md:hidden">
              {steps.map((s, i) => (
                <div key={i} className="rounded-2xl bg-background p-5 ring-1 ring-border shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-border">
                      <div className="text-primary">{s.icon}</div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Get To Know (button here, deep blue, big area) */}
      <section className="bg-primary/95 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="text-primary-foreground">
              <p className="text-sm font-medium text-primary-foreground/80">{t.finalKicker}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t.finalTitle}</p>
              <p className="mt-3 max-w-2xl text-primary-foreground/80">{t.finalSub}</p>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/test')}
              className="bg-white py-5 text-md font-bold text-primary hover:bg-white/90"
            >
              {t.finalCta}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
