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
  const { language } = useLanguage();
  const { toast } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // 表单状态
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
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '加载订阅包失败' : 'Failed to load subscription plans',
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
      // 验证表单
      if (!formData.name || !formData.trial_price || !formData.trial_duration || 
          !formData.recurring_price || !formData.recurring_duration) {
        toast({
          title: language === 'zh' ? '错误' : 'Error',
          description: language === 'zh' ? '请填写所有必填字段' : 'Please fill in all required fields',
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
          title: language === 'zh' ? '成功' : 'Success',
          description: language === 'zh' ? '订阅包已更新' : 'Subscription plan updated',
        });
      } else {
        await createSubscriptionPlan(planData);
        toast({
          title: language === 'zh' ? '成功' : 'Success',
          description: language === 'zh' ? '订阅包已创建' : 'Subscription plan created',
        });
      }

      setDialogOpen(false);
      loadPlans();
    } catch (error) {
      console.error('保存订阅包失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '保存订阅包失败' : 'Failed to save subscription plan',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPlanId) return;

    try {
      await deleteSubscriptionPlan(deletingPlanId);
      toast({
        title: language === 'zh' ? '成功' : 'Success',
        description: language === 'zh' ? '订阅包已删除' : 'Subscription plan deleted',
      });
      setDeleteDialogOpen(false);
      setDeletingPlanId(null);
      loadPlans();
    } catch (error) {
      console.error('删除订阅包失败:', error);
      toast({
        title: language === 'zh' ? '错误' : 'Error',
        description: language === 'zh' ? '删除订阅包失败' : 'Failed to delete subscription plan',
        variant: 'destructive',
      });
    }
  };

  const getTimeUnitLabel = (unit: TimeUnit) => {
    const labels = {
      DAY: language === 'zh' ? '天' : 'Day(s)',
      WEEK: language === 'zh' ? '周' : 'Week(s)',
      MONTH: language === 'zh' ? '月' : 'Month(s)',
      YEAR: language === 'zh' ? '年' : 'Year(s)',
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
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'zh' ? '订阅包管理' : 'Subscription Plans'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === 'zh' ? '管理所有订阅套餐配置' : 'Manage all subscription plan configurations'}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'zh' ? '新建订阅包' : 'New Plan'}
        </Button>
      </div>

      {/* 订阅包列表 */}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {!plan.is_active && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({language === 'zh' ? '已停用' : 'Inactive'})
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(plan)}
                  >
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
              {/* 试用信息 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  {language === 'zh' ? '试用期' : 'Trial Period'}
                </div>
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{plan.trial_price.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    / {plan.trial_duration} {getTimeUnitLabel(plan.trial_unit)}
                  </span>
                </div>
              </div>

              {/* 续费信息 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  {language === 'zh' ? '续费价格' : 'Recurring Price'}
                </div>
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{plan.recurring_price.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    / {plan.recurring_duration} {getTimeUnitLabel(plan.recurring_unit)}
                  </span>
                </div>
              </div>

              {/* PayPal Plan ID */}
              {plan.paypal_plan_id && (
                <div className="text-sm">
                  <span className="text-muted-foreground">PayPal Plan ID: </span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{plan.paypal_plan_id}</code>
                </div>
              )}

              {/* 描述 */}
              {plan.description.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-muted-foreground">
                    {language === 'zh' ? '包含内容' : 'Features'}
                  </div>
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

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan 
                ? (language === 'zh' ? '编辑订阅包' : 'Edit Subscription Plan')
                : (language === 'zh' ? '新建订阅包' : 'New Subscription Plan')}
            </DialogTitle>
            <DialogDescription>
              {language === 'zh' 
                ? '配置订阅包的价格、时长和描述信息' 
                : 'Configure subscription plan pricing, duration and description'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 套餐名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">{language === 'zh' ? '套餐名称' : 'Plan Name'} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'zh' ? '例如：7天试用套餐' : 'e.g., 7-Day Trial Plan'}
              />
            </div>

            {/* 试用期配置 */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-semibold">{language === 'zh' ? '试用期配置' : 'Trial Period'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trial_price">{language === 'zh' ? '试用价格' : 'Trial Price'} *</Label>
                  <Input
                    id="trial_price"
                    type="number"
                    step="0.01"
                    value={formData.trial_price}
                    onChange={(e) => setFormData({ ...formData, trial_price: e.target.value })}
                    placeholder="1.98"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trial_duration">{language === 'zh' ? '试用时长' : 'Trial Duration'} *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="trial_duration"
                      type="number"
                      value={formData.trial_duration}
                      onChange={(e) => setFormData({ ...formData, trial_duration: e.target.value })}
                      placeholder="7"
                      className="flex-1"
                    />
                    <Select
                      value={formData.trial_unit}
                      onValueChange={(value: TimeUnit) => setFormData({ ...formData, trial_unit: value })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">{language === 'zh' ? '天' : 'Day'}</SelectItem>
                        <SelectItem value="WEEK">{language === 'zh' ? '周' : 'Week'}</SelectItem>
                        <SelectItem value="MONTH">{language === 'zh' ? '月' : 'Month'}</SelectItem>
                        <SelectItem value="YEAR">{language === 'zh' ? '年' : 'Year'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 续费配置 */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-semibold">{language === 'zh' ? '续费配置' : 'Recurring Payment'}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurring_price">{language === 'zh' ? '续费价格' : 'Recurring Price'} *</Label>
                  <Input
                    id="recurring_price"
                    type="number"
                    step="0.01"
                    value={formData.recurring_price}
                    onChange={(e) => setFormData({ ...formData, recurring_price: e.target.value })}
                    placeholder="28.80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring_duration">{language === 'zh' ? '续费周期' : 'Recurring Period'} *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="recurring_duration"
                      type="number"
                      value={formData.recurring_duration}
                      onChange={(e) => setFormData({ ...formData, recurring_duration: e.target.value })}
                      placeholder="1"
                      className="flex-1"
                    />
                    <Select
                      value={formData.recurring_unit}
                      onValueChange={(value: TimeUnit) => setFormData({ ...formData, recurring_unit: value })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">{language === 'zh' ? '天' : 'Day'}</SelectItem>
                        <SelectItem value="WEEK">{language === 'zh' ? '周' : 'Week'}</SelectItem>
                        <SelectItem value="MONTH">{language === 'zh' ? '月' : 'Month'}</SelectItem>
                        <SelectItem value="YEAR">{language === 'zh' ? '年' : 'Year'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* PayPal Plan ID */}
            <div className="space-y-2">
              <Label htmlFor="paypal_plan_id">PayPal Plan ID</Label>
              <Input
                id="paypal_plan_id"
                value={formData.paypal_plan_id}
                onChange={(e) => setFormData({ ...formData, paypal_plan_id: e.target.value })}
                placeholder="P-XXXXXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'zh' ? '从PayPal后台获取的订阅计划ID' : 'Subscription plan ID from PayPal dashboard'}
              </p>
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">{language === 'zh' ? '套餐描述' : 'Description'}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'zh' 
                  ? '每行一个特性，例如：\n获得IQ分数并与名人比较\n了解你的强项、人格和职业倾向' 
                  : 'One feature per line, e.g.:\nGet IQ score and compare with celebrities\nUnderstand your strengths and career tendencies'}
                rows={5}
              />
            </div>

            {/* 启用状态 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">{language === 'zh' ? '启用此套餐' : 'Enable this plan'}</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button onClick={handleSave}>
              {language === 'zh' ? '保存' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'zh' ? '确认删除' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'zh' 
                ? '确定要删除这个订阅包吗？此操作无法撤销。' 
                : 'Are you sure you want to delete this subscription plan? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'zh' ? '取消' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {language === 'zh' ? '删除' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
