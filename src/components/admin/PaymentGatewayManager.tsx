import { useEffect, useState } from 'react';
import { getPaymentGatewayConfig, updatePaymentGatewayConfig } from '@/db/api';
import type { PaymentGatewayConfig } from '@/types/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Eye, EyeOff, Key, CreditCard } from 'lucide-react';

export default function PaymentGatewayManager() {
  const { toast } = useToast();

  const [config, setConfig] = useState<PaymentGatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

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
        title: '错误',
        description: '加载支付网关配置失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      if (!formData.client_id || !formData.secret_key) {
        toast({
          title: '错误',
          description: '请填写所有必填字段',
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
        title: '成功',
        description: '支付网关配置已更新',
      });

      loadConfig();
    } catch (error) {
      console.error('保存支付网关配置失败:', error);
      toast({
        title: '错误',
        description: '保存支付网关配置失败',
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
      <div>
        <h2 className="text-2xl font-bold">支付网关配置</h2>
        <p className="text-muted-foreground mt-1">
          配置 PayPal 支付网关的 API 凭证
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>PayPal 配置</CardTitle>
          </div>
          <CardDescription>
            从 PayPal 开发者后台获取 API 凭证
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              PayPal 应用的 Client ID，用于身份验证
            </p>
          </div>

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
              PayPal 应用的 Secret Key，请妥善保管
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">如何获取 API 凭证？</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>访问 PayPal Developer Dashboard</li>
              <li>创建或选择一个应用</li>
              <li>在应用详情页面找到 Client ID 和 Secret</li>
              <li>复制并粘贴到上方输入框</li>
            </ol>
            <a
              href="https://developer.paypal.com/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
            >
              打开 PayPal 开发者后台 →
            </a>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存配置
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">配置信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">网关名称:</span>
              <span className="font-medium">{config.gateway_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">状态:</span>
              <span className={`font-medium ${config.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {config.is_active ? '已启用' : '已停用'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最后更新:</span>
              <span className="font-medium">
                {new Date(config.updated_at).toLocaleString('zh-CN')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
