import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAllQuestions } from '@/db/api';
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
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

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

  const loadQuestions = async () => {
    try {
      const data = await getAllQuestions();
      if (data.length === 0) {
        toast({
          title: t.common.error,
          description: language === 'zh' ? '没有可用的题目，请联系管理员。' : 'No questions available.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      setQuestions(data);
    } catch (error) {
      console.error('加载题目失败:', error);
      toast({
        title: t.common.error,
        description: language === 'zh' ? '加载题目失败' : 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    setTestStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (answer: string) => {
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
        setShowCompletionModal(true);
      }
    }, 400);
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

  const handleSubmit = () => {
    const timeTaken = elapsedTime;
    
    // 保存答案和用时到localStorage
    localStorage.setItem('testAnswers', JSON.stringify(answers));
    localStorage.setItem('testTimeTaken', timeTaken.toString());
    
    // 跳转到加载分析页面
    navigate('/loading-analysis');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  // 开始页面 - 横向排列3个说明
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center py-8">
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
                  {language === 'zh' ? 'IQ 测试即将开始' : 'IQ Test About to Begin'}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {language === 'zh' 
                    ? '请仔细阅读以下说明，确保您在最佳状态下完成测试' 
                    : 'Please read the instructions carefully to ensure optimal test conditions'}
                </p>
              </div>

              {/* 3个说明 - 横向排列 */}
              <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {questions.length}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'zh' ? '题目数量' : 'Questions'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'zh' 
                      ? `共${questions.length}道题，难度递增` 
                      : `${questions.length} questions, increasing difficulty`}
                  </p>
                </div>

                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center">
                      <ListChecks className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'zh' ? '答题方式' : 'Answer Method'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'zh' 
                      ? '6个选项选1个，支持键盘快捷键' 
                      : '6 options, keyboard shortcuts supported'}
                  </p>
                </div>

                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center">
                      <Lightbulb className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'zh' ? '灵活作答' : 'Flexible'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === 'zh' 
                      ? '可跳过题目，随时返回修改' 
                      : 'Skip questions, return anytime'}
                  </p>
                </div>
              </div>

              {/* 开始按钮 */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartTest}
                  className="bg-primary hover:bg-primary/90 text-white text-lg px-12 py-6"
                >
                  {language === 'zh' ? '开始测试' : 'Start Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
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
    <div className="min-h-screen bg-muted flex items-center py-4">
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
          <Card className="shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* 左侧：问题图片 */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    <div className="aspect-square border-2 border-border rounded-lg overflow-hidden shadow-inner bg-muted/30">
                      <img
                        src={question.image_url}
                        alt={`Question ${question.question_number}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* 右侧：答案选项 */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {language === 'zh' ? '选择您的答案：' : 'Choose Your Answer:'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3">
                    {options.map((option) => {
                      const isSelected = answers[question.question_number] === option.label;
                      const isJustSelected = selectedOption === option.label;
                      
                      return (
                        <button
                          key={option.label}
                          onClick={() => handleAnswer(option.label)}
                          className={`relative aspect-square border-2 rounded-lg transition-all duration-200 ${
                            isSelected || isJustSelected
                              ? 'border-secondary bg-secondary/10'
                              : 'border-border bg-white hover:border-secondary'
                          }`}
                        >
                          <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected || isJustSelected
                              ? 'bg-secondary text-white'
                              : 'bg-muted text-foreground'
                          }`}>
                            {option.number}
                          </div>
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl font-bold text-foreground">{option.label}</span>
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
                      {language === 'zh' ? '上一页' : 'Prev'}
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                      <Button
                        onClick={() => setShowCompletionModal(true)}
                        className="bg-secondary hover:bg-secondary/90 gap-1"
                        size="sm"
                      >
                        {language === 'zh' ? '提交' : 'Submit'}
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext} size="sm" className="gap-1">
                        {language === 'zh' ? '下一页' : 'Next'}
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
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  index === currentQuestion
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
              🎉 {language === 'zh' ? '测试完成！' : 'Test Completed!'}
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">{language === 'zh' ? '已回答：' : 'Answered: '}</span>
                  <span className="text-primary font-bold">{answeredCount} / {questions.length}</span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold">{language === 'zh' ? '用时：' : 'Time: '}</span>
                  <span className="text-primary font-bold">{formatTime(elapsedTime)}</span>
                </p>
              </div>
              {answeredCount < questions.length && (
                <p className="text-sm text-muted-foreground">
                  {language === 'zh' 
                    ? `还有 ${questions.length - answeredCount} 道题未作答` 
                    : `${questions.length - answeredCount} questions unanswered`}
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
              {language === 'zh' ? '继续答题' : 'Continue'}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-secondary hover:bg-secondary/90"
            >
              {language === 'zh' ? '提交答案' : 'Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
