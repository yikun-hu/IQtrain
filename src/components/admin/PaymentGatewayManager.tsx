import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPaymentGatewayConfig, updatePaymentGatewayConfig } from '@/db/api';
import type { PaymentGatewayConfig } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Eye, EyeOff, Key, CreditCard } from 'lucide-react';

export default function PaymentGatewayManager() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [config, setConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    client_id: '',
    secret_key: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getPaymentGatewayConfig();
      if (data) {
        setConfig(data);
        setFormData({
          client_id: data.client_id,
          secret_key: data.secret_key,
        });
      }
    } catch (error) {
      console.error('加载支付网关配置失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '加载支付网关配置失败' : 'Failed to load payment gateway config',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      // 验证表单
      if (!formData.client_id || !formData.secret_key) {
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '请填写所有必填字段' : 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      setSaving(true);
      await updatePaymentGatewayConfig(config.id, {
        client_id: formData.client_id,
        secret_key: formData.secret_key,
      });

      toast({
        title: language === 'zh' ? '成功' : 'Success',
        description: language === 'zh' ? '支付网关配置已更新' : 'Payment gateway config updated',
      });

      loadConfig();
    } catch (error) {
      console.error('保存支付网关配置失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '保存支付网关配置失败' : 'Failed to save payment gateway config',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h2 className="text-2xl font-bold">
          {language === 'zh' ? '支付网关配置' : 'Payment Gateway Configuration'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {language === 'zh' ? '配置PayPal支付网关的API凭证' : 'Configure PayPal payment gateway API credentials'}
        </p>
      </div>

      {/* 配置卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>PayPal {language === 'zh' ? '配置' : 'Configuration'}</CardTitle>
          </div>
          <CardDescription>
            {language === 'zh' 
              ? '从PayPal开发者后台获取API凭证' 
              : 'Get API credentials from PayPal Developer Dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="client_id" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Client ID *
            </Label>
            <Input
              id="client_id"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              placeholder="AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'zh' 
                ? 'PayPal应用的Client ID，用于身份验证' 
                : 'PayPal application Client ID for authentication'}
            </p>
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="secret_key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Secret Key *
            </Label>
            <div className="relative">
              <Input
                id="secret_key"
                type={showSecretKey ? 'text' : 'password'}
                value={formData.secret_key}
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                placeholder="EXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx"
                className="font-mono text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'zh' 
                ? 'PayPal应用的Secret Key，请妥善保管' 
                : 'PayPal application Secret Key, keep it secure'}
            </p>
          </div>

          {/* 帮助信息 */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">
              {language === 'zh' ? '如何获取API凭证？' : 'How to get API credentials?'}
            </h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>
                {language === 'zh' 
                  ? '访问 PayPal Developer Dashboard' 
                  : 'Visit PayPal Developer Dashboard'}
              </li>
              <li>
                {language === 'zh' 
                  ? '创建或选择一个应用' 
                  : 'Create or select an application'}
              </li>
              <li>
                {language === 'zh' 
                  ? '在应用详情页面找到Client ID和Secret' 
                  : 'Find Client ID and Secret in app details'}
              </li>
              <li>
                {language === 'zh' 
                  ? '复制并粘贴到上方输入框' 
                  : 'Copy and paste into the fields above'}
              </li>
            </ol>
            <a
              href="https://developer.paypal.com/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
            >
              {language === 'zh' ? '打开PayPal开发者后台' : 'Open PayPal Developer Dashboard'} →
            </a>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'zh' ? '保存中...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {language === 'zh' ? '保存配置' : 'Save Configuration'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 当前配置信息 */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'zh' ? '配置信息' : 'Configuration Info'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'zh' ? '网关名称' : 'Gateway Name'}:</span>
              <span className="font-medium">{config.gateway_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'zh' ? '状态' : 'Status'}:</span>
              <span className={`font-medium ${config.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {config.is_active 
                  ? (language === 'zh' ? '已启用' : 'Active')
                  : (language === 'zh' ? '已停用' : 'Inactive')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'zh' ? '最后更新' : 'Last Updated'}:</span>
              <span className="font-medium">
                {new Date(config.updated_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
