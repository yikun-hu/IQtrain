import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { submitRefundRequest } from '@/db/api';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RequestRefundPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证邮箱
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      setErrorMessage(t.requestRefund.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await submitRefundRequest({
        email: email.trim(),
        reason: reason.trim() || undefined,
      });

      setSubmitStatus('success');
      setEmail('');
      setReason('');

      // 3秒后跳转到首页
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('提交退款申请失败:', error);
      setSubmitStatus('error');
      setErrorMessage(t.requestRefund.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.requestRefund.back}
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t.requestRefund.title}</CardTitle>
            <CardDescription className="text-base mt-2">{t.requestRefund.subtitle}</CardDescription>
          </CardHeader>

          <CardContent>
            {submitStatus === 'success' ? (
              // 成功提示
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  {t.requestRefund.successMsg}
                </AlertDescription>
              </Alert>
            ) : (
              // 表单
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 邮箱输入 */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    {t.requestRefund.emailLabel}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">{t.requestRefund.emailHelp}</p>
                </div>

                {/* 退款原因（可选） */}
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-base font-semibold">
                    {t.requestRefund.reasonLabel}
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={t.requestRefund.reasonPlaceholder}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{t.requestRefund.reasonHelp}</p>
                </div>

                {/* 错误提示 */}
                {submitStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="ml-2">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* 提交按钮 */}
                <Button type="submit" className="w-full text-base py-6" disabled={isSubmitting || !email}>
                  {isSubmitting ? t.requestRefund.submitting : t.requestRefund.submit}
                </Button>

                {/* 退款政策链接 */}
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate('/refund-policy')}
                    className="text-sm"
                  >
                    {t.requestRefund.viewPolicy}
                  </Button>
                </div>
              </form>
            )}

            {/* 客服联系信息 */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">{t.requestRefund.supportHint}</p>
              <p className="text-sm font-medium text-center mt-2">support@iqtrain.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
