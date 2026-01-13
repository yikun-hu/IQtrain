import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Brain, CheckCircle2 } from 'lucide-react';

export default function LoadingAnalysisPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const [currentModal, setCurrentModal] = useState(0);
  const [modalAnswers, setModalAnswers] = useState<string[]>([]);

  const tLoadingAnalysis = t.loadingAnalysis;


  // 进度控制
  useEffect(() => {
    // 只有当模态框未显示时才更新进度
    if (showModal) return;

    const duration = 6000; // 6秒（缩短分析时长）
    const interval = 100; // 每100ms更新一次
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        let newProgress = Math.min(prev + increment, 100);

        // 在25%、50%、75%时显示模态框并暂停进度
        if (prev < 25 && newProgress >= 25 && currentModal === 0) {
          newProgress = 25;
          setShowModal(true);
        } else if (prev < 50 && newProgress >= 50 && currentModal === 1) {
          newProgress = 50;
          setShowModal(true);
        } else if (prev < 75 && newProgress >= 75 && currentModal === 2) {
          newProgress = 75;
          setShowModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-start pt-12 justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-4xl shadow-2xl relative z-10 border-2">
        <CardContent className="px-6">
          {/* 水平布局：左侧包含所有内容，右侧只有维度列表 */}
          <div className="flex flex-col lg:flex-row items-start gap-10">
            {/* 左侧内容：标题、副标题、进度条、加载动画 */}
            <div className="flex-1 space-y-8 w-full">
              {/* 标题 */}
              <h1 className="text-2xl mt-8 xl:text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {tLoadingAnalysis.title}
              </h1>

              {/* 副标题 */}
              <p className="text-center text-muted-foreground text-sm xl:text-base my-2">
                {tLoadingAnalysis.subtitle}
              </p>

              {/* 进度条 */}
              <div>
                <div className="relative rounded-full overflow-hidden bg-muted/50 border border-border">
                  <Progress value={progress} className="h-12" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
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

              {/* 加载动画 */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-10 rounded-full border-2 border-primary/20">
                    <Brain className="h-32 w-32 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧维度检查列表 */}
            <div className="flex-1 space-y-4 w-full">
              {tLoadingAnalysis.dimensions.map((dimension, index) => {
                const Icon = dimension.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-500 ${checkedItems[index]
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-md'
                        : 'bg-card border-border/50'
                      }`}
                  >
                    {/* 复选框 */}
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all duration-300 ${checkedItems[index]
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
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${checkedItems[index]
                          ? 'bg-primary/20 text-primary scale-110'
                          : 'bg-muted/50 text-muted-foreground'
                        }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* 维度名称 */}
                    <span
                      className={`font-semibold text-sm transition-all duration-300 ${checkedItems[index]
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                        }`}
                    >
                      {dimension.name}
                    </span>

                    {/* 分析中/已完成 */}
                    {checkedItems[index] && (
                      <span className="ml-auto text-xs text-primary font-semibold animate-in fade-in duration-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.common.completed}
                      </span>
                    )}
                    {!checkedItems[index] && progress > index * 20 && (
                      <span className="ml-auto text-xs text-muted-foreground font-medium animate-pulse">
                        {t.common.analyzing}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模态框 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md border-2">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold text-center">
              {tLoadingAnalysis.modals[currentModal]?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {tLoadingAnalysis.modals[currentModal]?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            {tLoadingAnalysis.modals[currentModal]?.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleModalAnswer(option)}
                variant="ghost"
                className="w-full sm:flex-1 h-10 text-sm font-semibold bg-muted text-foreground transition-all duration-300 hover:border-primary hover:scale-105"
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
