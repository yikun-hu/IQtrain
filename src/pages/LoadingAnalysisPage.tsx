import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Brain, Zap, Target, Eye, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function LoadingAnalysisPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState(0);
  const [modalAnswers, setModalAnswers] = useState<string[]>([]);

  const content = {
    zh: {
      title: '计算你的智商分数',
      subtitle: '等一下，我们的人工智能会根据5个关键的智力指标分析你的答案',
      dimensions: [
        { name: '记忆力', icon: Brain },
        { name: '速度', icon: Zap },
        { name: '反应力', icon: Target },
        { name: '专注力', icon: Eye },
        { name: '逻辑思维', icon: Lightbulb },
      ],
      modals: [
        {
          title: '数字还是单词？',
          description: '你更擅长处理哪种类型的信息？',
          options: ['数字', '单词'],
        },
        {
          title: '你喜欢解谜吗？',
          description: '解决复杂问题对你来说是一种乐趣吗？',
          options: ['不', '是'],
        },
        {
          title: '单独工作还是团队合作？',
          description: '你更喜欢哪种工作方式？',
          options: ['单独', '团队'],
        },
      ],
    },
    en: {
      title: 'Calculating Your IQ Score',
      subtitle: 'Hold on, our AI is analyzing your answers based on 5 key intelligence indicators',
      dimensions: [
        { name: 'Memory', icon: Brain },
        { name: 'Speed', icon: Zap },
        { name: 'Reaction', icon: Target },
        { name: 'Concentration', icon: Eye },
        { name: 'Logic', icon: Lightbulb },
      ],
      modals: [
        {
          title: 'Numbers or Words?',
          description: 'Which type of information do you handle better?',
          options: ['Numbers', 'Words'],
        },
        {
          title: 'Do you like solving puzzles?',
          description: 'Is solving complex problems enjoyable for you?',
          options: ['No', 'Yes'],
        },
        {
          title: 'Work alone or in a team?',
          description: 'Which working style do you prefer?',
          options: ['Alone', 'Team'],
        },
      ],
    },
  };

  const t = content[language];

  // 进度控制
  useEffect(() => {
    const duration = 30000; // 30秒
    const interval = 100; // 每100ms更新一次
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + increment, 100);

        // 在25%、50%、75%时显示模态框
        if (!showModal) {
          if (newProgress >= 25 && newProgress < 26 && currentModal === 0) {
            setShowModal(true);
          } else if (newProgress >= 50 && newProgress < 51 && currentModal === 1) {
            setShowModal(true);
          } else if (newProgress >= 75 && newProgress < 76 && currentModal === 2) {
            setShowModal(true);
          }
        }

        // 根据进度勾选项目
        const checkIndex = Math.floor((newProgress / 100) * 5);
        setCheckedItems((prev) => {
          const newChecked = [...prev];
          for (let i = 0; i < checkIndex; i++) {
            newChecked[i] = true;
          }
          return newChecked;
        });

        // 100%时跳转
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            navigate('/collection');
          }, 500);
        }

        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [navigate, showModal, currentModal]);

  // 处理模态框答案
  const handleModalAnswer = (answer: string) => {
    setModalAnswers([...modalAnswers, answer]);
    setShowModal(false);
    setCurrentModal((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl relative z-10 border-2">
        <CardContent className="p-8 xl:p-12">
          {/* 顶部装饰图标 */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-full border-2 border-primary/20">
                <Brain className="h-20 w-20 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl xl:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t.title}
          </h1>

          {/* 副标题 */}
          <p className="text-center text-muted-foreground mb-10 text-base xl:text-lg">
            {t.subtitle}
          </p>

          {/* 进度条 */}
          <div className="mb-10">
            <div className="relative rounded-full overflow-hidden bg-muted/50 border border-border">
              <Progress value={progress} className="h-12" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-primary drop-shadow-sm">
                  {Math.round(progress)}%
                </span>
              </div>
              {/* 微光效果 */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                }}
              ></div>
            </div>
          </div>

          {/* 5个维度检查列表 */}
          <div className="space-y-3">
            {t.dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-500 ${
                    checkedItems[index]
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-md'
                      : 'bg-card border-border/50'
                  }`}
                >
                  {/* 复选框 */}
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all duration-300 ${
                      checkedItems[index]
                        ? 'bg-primary border-primary scale-110'
                        : 'border-muted-foreground/30 bg-background'
                    }`}
                  >
                    {checkedItems[index] && (
                      <Check className="h-5 w-5 text-primary-foreground animate-in zoom-in duration-300" />
                    )}
                  </div>

                  {/* 图标 */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      checkedItems[index]
                        ? 'bg-primary/20 text-primary scale-110'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* 维度名称 */}
                  <span
                    className={`font-semibold text-base transition-all duration-300 ${
                      checkedItems[index]
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {dimension.name}
                  </span>

                  {/* 分析中/已完成 */}
                  {checkedItems[index] && (
                    <span className="ml-auto text-sm text-primary font-semibold animate-in fade-in duration-300 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      {language === 'zh' ? '已完成' : 'Completed'}
                    </span>
                  )}
                  {!checkedItems[index] && progress > index * 20 && (
                    <span className="ml-auto text-sm text-muted-foreground font-medium animate-pulse">
                      {language === 'zh' ? '分析中...' : 'Analyzing...'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 模态框 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md border-2">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-center">
              {t.modals[currentModal]?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {t.modals[currentModal]?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            {t.modals[currentModal]?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleModalAnswer(option)}
                variant={index === 1 ? 'default' : 'outline'}
                className="w-full sm:flex-1 h-12 text-base font-semibold"
                size="lg"
              >
                {option}
              </Button>
            ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 微光动画CSS */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
