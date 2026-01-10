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
import { Loader2, Award, Clock, Target } from 'lucide-react';

export default function ResultsPage() {
  const { t } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

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
          title: t.common.error,
          description: 'No test results found',
          variant: 'destructive',
        });
        navigate('/test');
        return;
      }
      setResult(data);
    } catch (error) {
      console.error('加载测试结果失败:', error);
      toast({
        title: t.common.error,
        description: 'Failed to load test results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockReport = () => {
    navigate('/payment?type=one_time');
  };

  const handleSubscribe = () => {
    navigate('/payment?type=monthly');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const dimensionLabels: Record<string, string> = {
    memory: t.home.dimensions.memory,
    speed: t.home.dimensions.speed,
    reaction: t.home.dimensions.reaction,
    concentration: t.home.dimensions.concentration,
    logic: t.home.dimensions.logic,
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 xl:text-4xl">
          {t.results.title}
        </h1>

        {/* Main Score Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary to-accent text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{result.iq_score}</div>
              <div className="text-xl mb-4">{t.results.iqScore}</div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-5 w-5" />
                  <div>
                    <div className="text-sm opacity-90">{t.results.accuracy}</div>
                    <div className="text-lg font-bold">{result.score}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <div>
                    <div className="text-sm opacity-90">{t.results.timeTaken}</div>
                    <div className="text-lg font-bold">
                      {Math.floor(result.time_taken / 60)} {t.results.minutes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.results.dimensionScores}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(result.dimension_scores).map(([dimension, score]) => (
                <div key={dimension}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{dimensionLabels[dimension]}</span>
                    <span className="font-bold">{score}</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unlock Report CTA */}
        {!profile?.has_paid && (
          <Card className="mb-8 border-2 border-secondary">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t.results.unlockReport}</h3>
                <p className="text-muted-foreground mb-6">
                  {t.results.unlockDescription}
                </p>
                <div className="flex flex-col space-y-4 max-w-md mx-auto md:flex-row md:space-y-0 md:space-x-4">
                  <Button
                    className="flex-1"
                    onClick={handleUnlockReport}
                  >
                    {t.home.pricing.oneTime.cta} - $1.98
                  </Button>
                  <Button
                    className="flex-1 bg-secondary hover:bg-secondary/90"
                    onClick={handleSubscribe}
                  >
                    {t.home.pricing.monthly.cta} - $28.80/月
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/dashboard')}
          >
            {t.nav.dashboard}
          </Button>
          {profile?.has_paid && (
            <Button
              className="flex-1"
              onClick={() => navigate('/certificate')}
            >
              <Award className="h-4 w-4 mr-2" />
              {t.results.certificate}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
