import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from '@/db/api';
import type { SubscriptionPlan, TimeUnit } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function SubscriptionPlansManager() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    trial_price: '',
    trial_duration: '',
    trial_unit: 'DAY' as TimeUnit,
    recurring_price: '',
    recurring_duration: '',
    recurring_unit: 'MONTH' as TimeUnit,
    paypal_plan_id: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('加载订阅包失败:', error);
      toast({
        title: t.common.error,
        description: '加载订阅包失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        trial_price: plan.trial_price.toString(),
        trial_duration: plan.trial_duration.toString(),
        trial_unit: plan.trial_unit,
        recurring_price: plan.recurring_price.toString(),
        recurring_duration: plan.recurring_duration.toString(),
        recurring_unit: plan.recurring_unit,
        paypal_plan_id: plan.paypal_plan_id || '',
        description: plan.description.join('\n'),
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        trial_price: '',
        trial_duration: '',
        trial_unit: 'DAY',
        recurring_price: '',
        recurring_duration: '',
        recurring_unit: 'MONTH',
        paypal_plan_id: '',
        description: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (
        !formData.name ||
        !formData.trial_price ||
        !formData.trial_duration ||
        !formData.recurring_price ||
        !formData.recurring_duration
      ) {
        toast({
          title: t.common.error,
          description: '请填写所有必填字段',
          variant: 'destructive',
        });
        return;
      }

      const planData = {
        name: formData.name,
        trial_price: parseFloat(formData.trial_price),
        trial_duration: parseInt(formData.trial_duration),
        trial_unit: formData.trial_unit,
        recurring_price: parseFloat(formData.recurring_price),
        recurring_duration: parseInt(formData.recurring_duration),
        recurring_unit: formData.recurring_unit,
        paypal_plan_id: formData.paypal_plan_id || null,
        description: formData.description.split('\n').filter(line => line.trim()),
        is_active: formData.is_active,
      };

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, planData);
        toast({
          title: t.common.success,
          description: '订阅包已更新',
        });
      } else {
        await createSubscriptionPlan(planData);
        toast({
          title: t.common.success,
          description: '订阅包已创建',
        });
      }

      setDialogOpen(false);
      loadPlans();
    } catch (error) {
      console.error('保存订阅包失败:', error);
      toast({
        title: t.common.error,
        description: '保存订阅包失败',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPlanId) return;

    try {
      await deleteSubscriptionPlan(deletingPlanId);
      toast({
        title: t.common.success,
        description: '订阅包已删除',
      });
      setDeleteDialogOpen(false);
      setDeletingPlanId(null);
      loadPlans();
    } catch (error) {
      console.error('删除订阅包失败:', error);
      toast({
        title: t.common.error,
        description: '删除订阅包失败',
        variant: 'destructive',
      });
    }
  };

  const getTimeUnitLabel = (unit: TimeUnit) => {
    const labels = {
      DAY: '天',
      WEEK: '周',
      MONTH: '月',
      YEAR: '年',
    };
    return labels[unit];
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">订阅包管理</h2>
          <p className="text-muted-foreground mt-1">管理所有订阅套餐配置</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          新建订阅包
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {!plan.is_active && (
                    <span className="text-xs font-normal text-muted-foreground">
                      （已停用）
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingPlanId(plan.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">试用期</div>
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{plan.trial_price.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    / {plan.trial_duration} {getTimeUnitLabel(plan.trial_unit)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">续费价格</div>
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{plan.recurring_price.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    / {plan.recurring_duration} {getTimeUnitLabel(plan.recurring_unit)}
                  </span>
                </div>
              </div>

              {plan.paypal_plan_id && (
                <div className="text-sm">
                  <span className="text-muted-foreground">PayPal Plan ID：</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {plan.paypal_plan_id}
                  </code>
                </div>
              )}

              {plan.description.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-muted-foreground">包含内容</div>
                  <ul className="text-sm space-y-1">
                    {plan.description.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? '编辑订阅包' : '新建订阅包'}</DialogTitle>
            <DialogDescription>配置订阅包的价格、时长和描述信息</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">套餐名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：7天试用套餐"
              />
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-semibold">试用期配置</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>试用价格 *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.trial_price}
                    onChange={(e) =>
                      setFormData({ ...formData, trial_price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>试用时长 *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.trial_duration}
                      onChange={(e) =>
                        setFormData({ ...formData, trial_duration: e.target.value })
                      }
                    />
                    <Select
                      value={formData.trial_unit}
                      onValueChange={(value: TimeUnit) =>
                        setFormData({ ...formData, trial_unit: value })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">天</SelectItem>
                        <SelectItem value="WEEK">周</SelectItem>
                        <SelectItem value="MONTH">月</SelectItem>
                        <SelectItem value="YEAR">年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-semibold">续费配置</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>续费价格 *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.recurring_price}
                    onChange={(e) =>
                      setFormData({ ...formData, recurring_price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>续费周期 *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.recurring_duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurring_duration: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={formData.recurring_unit}
                      onValueChange={(value: TimeUnit) =>
                        setFormData({ ...formData, recurring_unit: value })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">天</SelectItem>
                        <SelectItem value="WEEK">周</SelectItem>
                        <SelectItem value="MONTH">月</SelectItem>
                        <SelectItem value="YEAR">年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>PayPal Plan ID</Label>
              <Input
                value={formData.paypal_plan_id}
                onChange={(e) =>
                  setFormData({ ...formData, paypal_plan_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                从 PayPal 后台获取的订阅计划 ID
              </p>
            </div>

            <div className="space-y-2">
              <Label>套餐描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={'每行一个特性，例如：\n获得 IQ 分数并与名人比较\n了解你的强项、人格和职业倾向'}
                rows={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>启用此套餐</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个订阅包吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}