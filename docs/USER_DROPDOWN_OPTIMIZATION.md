# 用户下拉列表优化文档

## 优化概述

本次优化针对Header组件的用户下拉菜单，实现了以下功能：
1. **Admin按钮**：管理员用户可见，点击跳转到管理后台
2. **智能订阅管理**：根据用户订阅状态显示订阅或退订按钮
3. **二次确认机制**：退订操作需要用户确认，防止误操作

## 功能详情

### 1. Admin按钮（管理员专属）

#### 显示条件
- 用户角色为 `admin`（`profile.role === 'admin'`）
- 仅在下拉菜单中对管理员可见

#### 功能
- 点击跳转到 `/admin` 管理后台页面
- 使用 `Shield` 图标标识管理员权限

#### 代码实现
```tsx
{isAdmin && (
  <>
    <DropdownMenuItem onClick={() => navigate('/admin')}>
      <Shield className="mr-2 h-4 w-4" />
      <span>{language === 'zh' ? '管理后台' : 'Admin'}</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
  </>
)}
```

### 2. 订阅状态检测

#### 判断逻辑
```tsx
const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
```

#### 检测条件
- `subscription_type` 为 `'monthly'`（月度订阅）
- `subscription_expires_at` 存在（订阅到期时间）

### 3. 订阅/退订按钮

#### 3.1 已订阅用户 - 显示退订按钮

**显示条件**：`hasSubscription === true`

**功能**：
- 点击打开退订确认对话框
- 使用 `Bell` 图标
- 文字：中文"退订" / 英文"Unsubscribe"

**代码**：
```tsx
{hasSubscription ? (
  <DropdownMenuItem onClick={() => setShowUnsubscribeDialog(true)}>
    <Bell className="mr-2 h-4 w-4" />
    <span>{language === 'zh' ? '退订' : 'Unsubscribe'}</span>
  </DropdownMenuItem>
) : (
  // 未订阅用户显示订阅按钮
)}
```

#### 3.2 未订阅用户 - 显示订阅按钮

**显示条件**：`hasSubscription === false`

**功能**：
- 点击跳转到 `/payment` 支付页面
- 使用 `CreditCard` 图标
- 文字：中文"订阅" / 英文"Subscribe"

**代码**：
```tsx
<DropdownMenuItem onClick={() => navigate('/payment')}>
  <CreditCard className="mr-2 h-4 w-4" />
  <span>{language === 'zh' ? '订阅' : 'Subscribe'}</span>
</DropdownMenuItem>
```

### 4. 退订确认对话框

#### 对话框组件
使用 shadcn/ui 的 `AlertDialog` 组件实现

#### 对话框内容

**标题**：
- 中文：确认取消订阅
- 英文：Confirm Unsubscribe

**描述**：
- 中文：您确定要取消订阅吗？取消后您将失去所有订阅权益，包括专业训练课程和定期测评。
- 英文：Are you sure you want to cancel your subscription? You will lose access to all subscription benefits, including professional training courses and regular assessments.

**按钮**：
- 取消按钮：关闭对话框，不执行操作
- 确认按钮：执行退订操作，按钮为红色（destructive）

#### 代码实现
```tsx
<AlertDialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        {language === 'zh' ? '确认取消订阅' : 'Confirm Unsubscribe'}
      </AlertDialogTitle>
      <AlertDialogDescription>
        {language === 'zh' 
          ? '您确定要取消订阅吗？取消后您将失去所有订阅权益，包括专业训练课程和定期测评。' 
          : 'Are you sure you want to cancel your subscription? You will lose access to all subscription benefits, including professional training courses and regular assessments.'}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isUnsubscribing}>
        {language === 'zh' ? '取消' : 'Cancel'}
      </AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleUnsubscribe}
        disabled={isUnsubscribing}
        className="bg-destructive hover:bg-destructive/90"
      >
        {isUnsubscribing 
          ? (language === 'zh' ? '处理中...' : 'Processing...') 
          : (language === 'zh' ? '确认退订' : 'Confirm')}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 5. 退订处理函数

#### 函数功能
```tsx
const handleUnsubscribe = async () => {
  if (!user) return;
  
  setIsUnsubscribing(true);
  try {
    await cancelSubscription(user.id);
    await refreshProfile(); // 刷新用户资料
    toast({
      title: language === 'zh' ? '成功' : 'Success',
      description: language === 'zh' ? '已成功取消订阅' : 'Subscription cancelled successfully',
    });
    setShowUnsubscribeDialog(false);
  } catch (error) {
    console.error('取消订阅失败:', error);
    toast({
      title: language === 'zh' ? '错误' : 'Error',
      description: language === 'zh' ? '取消订阅失败，请稍后重试' : 'Failed to cancel subscription',
      variant: 'destructive',
    });
  } finally {
    setIsUnsubscribing(false);
  }
};
```

#### 处理流程
1. 检查用户是否登录
2. 设置加载状态
3. 调用 `cancelSubscription` API
4. 刷新用户资料（更新订阅状态）
5. 显示成功提示
6. 关闭对话框
7. 错误处理和提示

## API函数

### cancelSubscription

**文件位置**：`src/db/api.ts`

**函数签名**：
```typescript
export async function cancelSubscription(userId: string): Promise<Profile | null>
```

**功能**：
- 将用户的 `subscription_type` 设置为 `null`
- 将用户的 `subscription_expires_at` 设置为 `null`
- 返回更新后的用户资料

**实现代码**：
```typescript
export async function cancelSubscription(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_type: null,
      subscription_expires_at: null,
    })
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}
```

## 下拉菜单结构

### 完整菜单项顺序

1. **用户邮箱**（Label，不可点击）
2. **分隔线**
3. **Admin按钮**（仅管理员可见）
4. **分隔线**（仅管理员可见）
5. **仪表盘**
6. **分隔线**
7. **订阅/退订按钮**（根据订阅状态显示）
8. **分隔线**
9. **隐私政策**
10.**用户协议**
11.**Cookie政策**
12.**分隔线**
13.**登出**

### 视觉层级

```
┌─────────────────────────────┐
│ 📧 user@example.com         │  ← 用户邮箱
├─────────────────────────────┤
│ 🛡️ 管理后台                 │  ← Admin（仅管理员）
├─────────────────────────────┤
│ 📊 仪表盘                   │
├─────────────────────────────┤
│ 💳 订阅 / 🔔 退订           │  ← 根据状态显示
├─────────────────────────────┤
│ ✓ 隐私政策                  │
│ 📄 用户协议                 │
│ 🍪 Cookie政策               │
├─────────────────────────────┤
│ 🚪 登出                     │
└─────────────────────────────┘
```

## 图标使用

| 功能 | 图标 | 来源 |
|------|------|------|
| 用户邮箱 | Mail | lucide-react |
| 管理后台 | Shield | lucide-react |
| 仪表盘 | LayoutDashboard | lucide-react |
| 退订 | Bell | lucide-react |
| 订阅 | CreditCard | lucide-react |
| 隐私政策 | FileCheck | lucide-react |
| 用户协议 | FileText | lucide-react |
| Cookie政策 | FileText | lucide-react |
| 登出 | LogOut | lucide-react |

## 状态管理

### 组件状态

```tsx
const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
const [isUnsubscribing, setIsUnsubscribing] = useState(false);
```

### 计算属性

```tsx
const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
const isAdmin = profile?.role === 'admin';
```

## 用户体验优化

### 1. 防止误操作
- 退订需要二次确认
- 确认对话框使用红色按钮（destructive）提醒用户操作的严重性
- 清晰说明退订后的影响

### 2. 加载状态
- 退订过程中显示"处理中..."
- 按钮禁用，防止重复点击

### 3. 反馈机制
- 成功退订后显示成功提示
- 失败时显示错误提示
- 自动刷新用户资料，更新UI状态

### 4. 权限控制
- Admin按钮仅管理员可见
- 根据订阅状态动态显示按钮
- 未登录用户不显示下拉菜单

## 多语言支持

### 中文文案
- 管理后台
- 退订
- 订阅
- 确认取消订阅
- 您确定要取消订阅吗？取消后您将失去所有订阅权益，包括专业训练课程和定期测评。
- 取消
- 确认退订
- 处理中...
- 成功
- 已成功取消订阅
- 错误
- 取消订阅失败，请稍后重试

### 英文文案
- Admin
- Unsubscribe
- Subscribe
- Confirm Unsubscribe
- Are you sure you want to cancel your subscription? You will lose access to all subscription benefits, including professional training courses and regular assessments.
- Cancel
- Confirm
- Processing...
- Success
- Subscription cancelled successfully
- Error
- Failed to cancel subscription

## 技术实现细节

### 依赖组件
- `DropdownMenu` 系列组件（shadcn/ui）
- `AlertDialog` 系列组件（shadcn/ui）
- `useToast` Hook（shadcn/ui）
- `useAuth` Context（自定义）
- `useLanguage` Context（自定义）

### 导入的图标
```tsx
import { 
  User, Lock, FileCheck, FileText, LogOut, Globe, 
  LayoutDashboard, Mail, Bell, Gamepad2, ClipboardList, 
  Shield, CreditCard 
} from 'lucide-react';
```

### 新增API导入
```tsx
import { signOut, cancelSubscription } from '@/db/api';
```

## 测试场景

### 场景1：普通用户（未订阅）
1. 点击用户图标打开下拉菜单
2. 不显示Admin按钮
3. 显示"订阅"按钮
4. 点击"订阅"跳转到支付页面

### 场景2：普通用户（已订阅）
1. 点击用户图标打开下拉菜单
2. 不显示Admin按钮
3. 显示"退订"按钮
4. 点击"退订"打开确认对话框
5. 点击"取消"关闭对话框
6. 再次点击"退订"，点击"确认退订"
7. 显示成功提示，订阅状态更新

### 场景3：管理员用户
1. 点击用户图标打开下拉菜单
2. 显示"管理后台"按钮（在最前面）
3. 点击"管理后台"跳转到/admin页面
4. 根据订阅状态显示"订阅"或"退订"按钮

### 场景4：退订失败
1. 点击"退订"
2. 点击"确认退订"
3. 网络错误或服务器错误
4. 显示错误提示
5. 对话框保持打开，用户可以重试

## 总结

本次优化实现了：
- ✅ Admin按钮（管理员专属）
- ✅ 智能订阅状态检测
- ✅ 订阅/退订按钮动态显示
- ✅ 退订二次确认机制
- ✅ 完整的错误处理
- ✅ 友好的用户反馈
- ✅ 多语言支持
- ✅ 响应式设计
- ✅ 无障碍访问

用户体验显著提升，功能更加完善和安全。
