import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { getScaleTestQuestions, calculateScaleTestScore, saveScaleTestResult, getScaleScoringRuleByScore, calculatePercentile } from '@/db/api';
import type { ScaleTestQuestion, ScaleTestType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';

export default function ScaleTestPage() {
  const { testType } = useParams<{ testType: string }>();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<ScaleTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadQuestions();
  }, [testType, user]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getScaleTestQuestions(testType as ScaleTestType);
      setQuestions(data);
    } catch (error) {
      console.error('加载题目失败:', error);
      toast({
        title: t.scaleTest.loadingFailed,
        description: t.scaleTest.failedToLoadQuestions,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (score: number) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = { ...answers, [currentQuestion.question_id]: score };
    setAnswers(newAnswers);

    // 延迟一下，让状态更新完成后再跳转
    setTimeout(() => {
      // 如果是最后一题，提交结果
      if (currentIndex === questions.length - 1) {
        submitTest(newAnswers);
      } else {
        // 否则进入下一题
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handleQuestionClick = (index: number) => {
    // 允许点击圆圈跳转到对应题目
    if (!submitting) {
      setCurrentIndex(index);
    }
  };

  const submitTest = async (finalAnswers: Record<string, number>) => {
    if (!user) return;

    try {
      setSubmitting(true);

      // 计算总分
      const totalScore = calculateScaleTestScore(finalAnswers, questions);
      const maxScore = questions.length * 5;
      const percentile = calculatePercentile(totalScore, maxScore);

      // 获取对应的等级
      const scoringRule = await getScaleScoringRuleByScore(testType as ScaleTestType, totalScore, language);

      if (!scoringRule) {
        throw new Error('无法找到对应的评分规则');
      }

      // 保存测试结果
      const result = await saveScaleTestResult(
        user.id,
        testType as ScaleTestType,
        finalAnswers,
        totalScore,
        scoringRule.level,
        percentile
      );

      if (result) {
        // 跳转到报告页面
        navigate(`/scale-test-report/${result.id}`);
      }
    } catch (error) {
      console.error('提交测试失败:', error);
      toast({
        title: t.scaleTest.submissionFailed,
        description: t.scaleTest.failedToSubmitResults,
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const getTestTitle = () => {
    if (testType === 'emotional_recognition') {
      return t.scaleTest.emotionalRecognitionTest;
    } else if (testType === 'stress_index') {
      return t.scaleTest.stressIndexSelfAssessment;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {t.scaleTest.noQuestionsAvailable}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* 标题和进度 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{getTestTitle()}</h1>
          <p className="text-muted-foreground mb-4">
            {t.scaleTest.questionCount.replace('{{current}}', (currentIndex + 1).toString()).replace('{{total}}', questions.length.toString())}
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 题目卡片 */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-8">
              {currentQuestion.question_text[language]}
            </h2>

            <RadioGroup
              value={answers[currentQuestion.question_id]?.toString() || ''}
              onValueChange={(value) => handleAnswer(parseInt(value))}
              disabled={submitting}
            >
              <div className="space-y-4">
                {[
                  { value: 1, label: t.scaleTest.stronglyDisagree },
                  { value: 2, label: t.scaleTest.disagree },
                  { value: 3, label: t.scaleTest.neutral },
                  { value: 4, label: t.scaleTest.agree },
                  { value: 5, label: t.scaleTest.stronglyAgree },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
                  >
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="flex-1 cursor-pointer text-base font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* 进度圆圈指示器 */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {questions.map((q, index) => {
                  const isAnswered = answers[q.question_id] !== undefined;
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={q.question_id}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer
                        ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${isAnswered ? 'bg-primary text-primary-foreground hover:bg-primary/80' : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                        ${submitting ? 'cursor-not-allowed opacity-50' : ''}
                      `}
                      title={`${t.scaleTest.question} ${index + 1}${isAnswered ? t.scaleTest.questionCompleted : ''}`}
                      onClick={() => handleQuestionClick(index)}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                {t.scaleTest.questionsCompleted
                  .replace('{{completed}}', Object.keys(answers).length.toString())
                  .replace('{{total}}', questions.length.toString())}
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {t.scaleTest.clickToReview}
              </p>
            </div>

            {submitting && (
              <div className="mt-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">
                  {t.scaleTest.generatingReport}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {t.scaleTest.instruction}
          </p>
        </div>
      </div>
    </div>
  );
}
