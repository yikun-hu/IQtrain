import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllQuestions, saveTestResult } from '@/db/api';
import type { IQQuestion } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle2, Brain, ListChecks, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// ---- 图片预加载：全局内存缓存（模块级，跨render复用）----
const imageTaskCache = new Map<string, Promise<void>>(); // url -> Promise(加载+解码完成)

/** 预加载并尽可能解码到内存；同URL只做一次 */
function preloadImage(url?: string | null): Promise<void> {
  if (!url) return Promise.resolve();

  const key = url.trim();
  if (!key) return Promise.resolve();

  const existing = imageTaskCache.get(key);
  if (existing) return existing;

  const task = new Promise<void>((resolve) => {
    const img = new Image();
    // 如果你的图片是跨域且需要绘制到canvas，才需要 crossOrigin；否则可不设
    // img.crossOrigin = 'anonymous';

    img.onload = async () => {
      // 尽量让浏览器把图片解码进内存，降低切换闪烁
      try {
        // @ts-ignore - 部分浏览器支持 HTMLImageElement.decode()
        if (typeof img.decode === 'function') await img.decode();
      } catch {
        // decode 失败不影响流程
      }
      resolve();
    };
    img.onerror = () => resolve(); // 出错也 resolve，避免卡住队列
    img.src = key;
  });

  imageTaskCache.set(key, task);
  return task;
}

/** 顺序预加载（严格从前到后） */
async function preloadAllQuestionsSequentially(list: IQQuestion[], signal?: AbortSignal) {
  for (const q of list) {
    if (signal?.aborted) return;

    // 题干图
    await preloadImage(q.image_url);

    // 选项图（按 A-F 顺序）
    await preloadImage(q.option_a);
    await preloadImage(q.option_b);
    await preloadImage(q.option_c);
    await preloadImage(q.option_d);
    await preloadImage(q.option_e);
    await preloadImage(q.option_f);
  }
}

export default function TestPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<IQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);



  useEffect(() => {
    if (testStarted && !showCompletionModal) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, showCompletionModal]);

  // 键盘快捷键
  useEffect(() => {
    if (!testStarted || showCompletionModal) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const options = ['A', 'B', 'C', 'D', 'E', 'F'];
        handleAnswer(options[optionIndex]);
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testStarted, showCompletionModal, currentQuestion, questions]);

  // 题目获取后：立刻从前往后顺序预加载所有图片
  useEffect(() => {
    if (!questions.length) return;

    const controller = new AbortController();

    // 不阻塞首屏：丢到空闲/宏任务里开始
    const start = () => {
      preloadAllQuestionsSequentially(questions, controller.signal);
    };

    // 有 requestIdleCallback 用它，没有就 setTimeout
    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(start);
      return () => {
        controller.abort();
        w.cancelIdleCallback?.(id);
      };
    } else {
      const id = window.setTimeout(start, 0);
      return () => {
        controller.abort();
        window.clearTimeout(id);
      };
    }
  }, [questions]);

  // 切到任意题目时：兜底确保"当前题+6选项"已在缓存（避免用户在全量预加载未完成时跳题闪一下）
  useEffect(() => {
    const q = questions[currentQuestion];
    if (!q) return;

    preloadImage(q.image_url);
    preloadImage(q.option_a);
    preloadImage(q.option_b);
    preloadImage(q.option_c);
    preloadImage(q.option_d);
    preloadImage(q.option_e);
    preloadImage(q.option_f);
  }, [questions, currentQuestion]);

  // 当题目切换时清除选中状态，防止移动端hover状态持续
  useEffect(() => {
    setSelectedOption(null);
    setHoveredOption(null);
  }, [currentQuestion]);


  const handleStartTest = async () => {
    // 开始加载动画并加载题目
    setButtonLoading(true);

    try {
      // 加载题目
      const data = await getAllQuestions();
      if (data.length === 0) {
        toast({
          title: t.common.error,
          description: t.test.errors.noQuestions,
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      setQuestions(data);

      // 加载成功后开始测试
      setTestStarted(true);
    } catch (error) {
      console.error('加载题目失败:', error);
      toast({
        title: t.common.error,
        description: t.test.errors.loadFailed,
        variant: 'destructive',
      });
    } finally {
      setButtonLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    // 安全检查：确保当前题目存在
    if (!questions[currentQuestion]) {
      console.error('当前题目不存在');
      return;
    }

    setSelectedOption(answer);
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].question_number]: answer,
    };
    setAnswers(newAnswers);

    // 保存到localStorage
    localStorage.setItem('testAnswers', JSON.stringify(newAnswers));

    // 400ms后自动跳转
    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // 只有当所有问题都已回答时才显示完成模态框
        if (allQuestionsAnswered()) {
          setShowCompletionModal(true);
        }
      }
    }, 200);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const timeTaken = elapsedTime;

    // 保存答案和用时到localStorage（作为备份）
    localStorage.setItem('testAnswers', JSON.stringify(answers));
    localStorage.setItem('testTimeTaken', timeTaken.toString());

    // 计算分数
    const correctCount = questions.reduce((count, question) => {
      const userAnswer = answers[question.question_number];
      return userAnswer === question.correct_answer ? count + 1 : count;
    }, 0);

    // 检查正确答案数量是否小于等于7道
    if (correctCount <= 7) {
      setShowInsufficientModal(true);
      return;
    }

    // 如果用户已登录，直接保存到后端
    if (user) {
      try {
        const score = Math.round((correctCount / questions.length) * 100);
        const iqScore = Math.round(85 + (score / 100) * 60); // IQ范围: 85-145

        // 计算各维度分数
        const dimensionScores: Record<string, number> = {
          memory: 0,
          speed: 0,
          reaction: 0,
          concentration: 0,
          logic: 0,
        };

        const dimensionCounts: Record<string, number> = {
          memory: 0,
          speed: 0,
          reaction: 0,
          concentration: 0,
          logic: 0,
        };

        questions.forEach((question) => {
          const userAnswer = answers[question.question_number];
          const isCorrect = userAnswer === question.correct_answer;
          const dimension = question.dimension;

          if (dimensionScores[dimension] !== undefined) {
            dimensionScores[dimension] += isCorrect ? 1 : 0;
            dimensionCounts[dimension] += 1;
          }
        });

        // 转换为百分比
        Object.keys(dimensionScores).forEach((dimension) => {
          if (dimensionCounts[dimension] > 0) {
            dimensionScores[dimension] = Math.round(
              (dimensionScores[dimension] / dimensionCounts[dimension]) * 100
            );
          }
        });

        // 保存测试结果
        await saveTestResult({
          user_id: user.id,
          answers,
          score,
          test_type: 'iq',
          iq_score: iqScore,
          dimension_scores: dimensionScores,
          time_taken: timeTaken,
        });

        toast({
          title: t.common.success,
          description: t.test.completion.resultSaved,
        });
      } catch (error) {
        console.error('保存测试结果失败:', error);
        // 即使保存失败也继续流程
      }
    }

    // 跳转到加载分析页面
    navigate('/loading-analysis');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  // 检查是否所有问题都已回答
  const allQuestionsAnswered = () => {
    return questions.every(question => answers[question.question_number] !== undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0 && testStarted) {
    return null;
  }

  // 开始页面 - 横向排列3个说明
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex pt-6 py-2 sm:pt-12 sm:py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="shadow-2xl">
            <CardContent className="pt-12 pb-12">
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  {t.test.start.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t.test.start.instructions}
                </p>
              </div>

              {/* 开始按钮 */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  disabled={buttonLoading}
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-12 py-6"
                >
                  {buttonLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {/* {t.test.start.loadingQuestions} */}
                    </>
                  ) : (
                    t.test.start.startButton
                  )}
                </Button>
              </div>

              {/* 3个说明 - 横向排列 */}
              <div className="grid grid-cols-1 gap-6 my-6 md:grid-cols-3">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      20
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t.test.start.questions}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.test.start.questionsDesc(20)}
                  </p>
                </div>

                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center">
                      <ListChecks className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t.test.start.answerMethod}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.test.start.answerMethodDesc}
                  </p>
                </div>

                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center">
                      <Lightbulb className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t.test.start.flexible}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.test.start.flexibleDesc}
                  </p>
                </div>

              </div>

              <p className="text-center text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {t.test.start.disclaimer}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  // 安全检查：确保question对象存在
  if (!question) {
    return (
      <div className="min-h-screen bg-muted flex md:pt-12 justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                {t.test.loading}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const options = [
    { label: 'A', value: question.option_a, number: 1 },
    { label: 'B', value: question.option_b, number: 2 },
    { label: 'C', value: question.option_c, number: 3 },
    { label: 'D', value: question.option_d, number: 4 },
    { label: 'E', value: question.option_e, number: 5 },
    { label: 'F', value: question.option_f, number: 6 },
  ];

  return (
    <div className="min-h-screen bg-muted flex pt-6 py-2 sm:pt-12 sm:py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="space-y-4">
          {/* 计时器和进度条 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 bg-white px-6 py-2 rounded-lg shadow-md border border-border">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <div className="bg-secondary text-white px-6 py-2 rounded-full font-bold">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>

          {/* 问题卡片 - 紧凑布局 */}
          <Card className="shadow-lg py-0 sm:py-6 max-w-96 sm:max-w-[100%] justify-self-center">
            <CardContent className="pt-6 pb-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* 左侧：问题图片 */}
                <div className="flex items-center justify-center flex-col">
                  <h3 className="text-lg font-semibold mb-4">
                    {t.test.testInterface.questionPrompt}
                  </h3>
                  <div className="w-full max-w-md flex justify-center">
                    <div className="border-2 border-border rounded-lg overflow-hidden shadow-inner bg-muted/30 p-6">
                      <img
                        src={question.image_url}
                        alt={`Question ${question.question_number}`}
                        className="max-w-full h-auto object-contain"
                        loading="eager" decoding="async" draggable={false}
                      />
                    </div>
                  </div>
                </div>

                {/* 右侧：答案选项 */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {t.test.testInterface.chooseAnswer}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-6 md:grid-cols-3">
                    {options.map((option) => {
                      const isSelected = answers[question.question_number] === option.label;
                      const isJustSelected = selectedOption === option.label;

                      return (
                        <button
                          key={option.label}
                          onClick={() => {
                            setSelectedOption(null);
                            setHoveredOption(null);
                            handleAnswer(option.label);
                          }}
                          onMouseEnter={() => !isSelected && setHoveredOption(option.label)}
                          onMouseLeave={() => setHoveredOption(null)}
                          onTouchStart={() => !isSelected && setHoveredOption(option.label)}
                          onTouchEnd={() => setHoveredOption(null)}
                          className={`relative aspect-square border-2 rounded-lg transition-all duration-200 ${isSelected || isJustSelected
                            ? 'border-secondary bg-secondary/10'
                            : hoveredOption === option.label ? 'border-secondary bg-secondary/10' : 'border-border bg-white'
                            }`}
                        >
                          <div className={`absolute top-2 left-2 h-4 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold ${isSelected || isJustSelected
                            ? 'bg-secondary text-white'
                            : hoveredOption === option.label ? 'bg-secondary text-white' : 'bg-muted text-foreground'
                            }`}>
                            {option.number}
                          </div>
                          <div className="flex items-center justify-center h-full px-4 pt-3 md:px-6 md:pt-6">
                            <img
                              src={option.value}
                              alt={`Option ${option.label}`}
                              className="w-full h-full object-contain"
                              loading="eager" decoding="async" draggable={false}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 导航按钮 */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      size="sm"
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t.test.testInterface.prev}
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                      allQuestionsAnswered() ? (
                        <Button
                          onClick={() => setShowCompletionModal(true)}
                          className="bg-secondary hover:bg-secondary/90 gap-1"
                          size="sm"
                        >
                          {t.test.testInterface.submit}
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex flex-col items-end">
                          <p className="text-sm text-muted-foreground mb-2">
                            {t.test.testInterface.completeAll}
                          </p>
                          <Button variant="outline" size="sm" className="gap-1">
                            {t.test.testInterface.finalQuestion}
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button onClick={handleNext} size="sm" className="gap-1">
                        {t.test.testInterface.next}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 题目导航点 - 紧凑显示 */}
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${index === currentQuestion
                  ? 'bg-primary text-white scale-110'
                  : answers[questions[index].question_number]
                    ? 'bg-accent text-white'
                    : 'bg-white border-2 border-border text-foreground hover:border-primary'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 完成模态框 */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              🎉 {t.test.completion.title}
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">{t.test.completion.answered}</span>
                  <span className="text-primary font-bold">{answeredCount} / {questions.length}</span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold">{t.test.completion.time}</span>
                  <span className="text-primary font-bold">{formatTime(elapsedTime)}</span>
                </p>
              </div>
              {answeredCount < questions.length && (
                <p className="text-sm text-muted-foreground">
                  {`${questions.length - answeredCount} ${t.test.completion.unanswered}`}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCompletionModal(false)}
              className="flex-1"
            >
              {t.test.completion.continue}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-secondary hover:bg-secondary/90"
            >
              {t.test.completion.submitAnswer}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 信息不足模态框 */}
      <Dialog open={showInsufficientModal} onOpenChange={setShowInsufficientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              ⚠️ {t.test.insufficient.title}
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <p className="text-lg">
                {t.test.insufficient.message1}
              </p>
              <p className="text-lg">
                {t.test.insufficient.message2}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => {
                // 重置测试状态，让用户重新开始
                setShowInsufficientModal(false);
                setShowCompletionModal(false); // 重置完成模态框状态
                setTestStarted(false);
                setCurrentQuestion(0);
                setAnswers({});
                setElapsedTime(0);
                localStorage.removeItem('testAnswers');
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {t.test.insufficient.restart}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
