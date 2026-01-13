# 订阅和退订按钮展示逻辑文档

## 📊 数据表信息

### 数据表名称
**`profiles`** - 用户档案表

### 数据库位置
- 数据库：Supabase PostgreSQL
- Schema：public
- 表名：profiles

## 🔑 关键字段

### 1. subscription_type（订阅类型）

**字段信息**：
- 字段名：`subscription_type`
- 数据类型：`subscription_type` (ENUM)
- 可选值：
  - `'one_time'` - 一次性付费
  - `'monthly'` - 月度订阅
  - `NULL` - 未订阅
- 默认值：`NULL`
- 可空：是

**枚举定义**（SQL）：
```sql
CREATE TYPE subscription_type AS ENUM ('one_time', 'monthly');
```

**字段定义**（SQL）：
```sql
subscription_type subscription_type,
```

### 2. subscription_expires_at（订阅到期时间）

**字段信息**：
- 字段名：`subscription_expires_at`
- 数据类型：`TIMESTAMPTZ` (带时区的时间戳)
- 含义：订阅服务的到期时间
- 默认值：`NULL`
- 可空：是

**字段定义**（SQL）：
```sql
subscription_expires_at TIMESTAMPTZ,
```

## 🎯 展示逻辑

### 判断条件（TypeScript）

```typescript
// 位置：src/components/common/Header.tsx 第92行
const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
```

### 逻辑说明

**有订阅（显示"退订"按钮）**：
- 条件1：`subscription_type === 'monthly'`（订阅类型为月度订阅）
- 条件2：`subscription_expires_at` 存在（有到期时间）
- 逻辑：两个条件必须**同时满足**（AND关系）

**无订阅（显示"订阅"按钮）**：
- 条件1：`subscription_type !== 'monthly'`（订阅类型不是月度订阅）
- 或条件2：`subscription_expires_at` 为空（没有到期时间）
- 逻辑：任一条件满足即可（OR关系）

### 具体场景

| subscription_type | subscription_expires_at | hasSubscription | 显示按钮 |
|-------------------|-------------------------|-----------------|----------|
| `'monthly'` | `'2025-12-31T00:00:00Z'` | `true` | 退订 |
| `'monthly'` | `NULL` | `false` | 订阅 |
| `'one_time'` | `'2025-12-31T00:00:00Z'` | `false` | 订阅 |
| `'one_time'` | `NULL` | `false` | 订阅 |
| `NULL` | `'2025-12-31T00:00:00Z'` | `false` | 订阅 |
| `NULL` | `NULL` | `false` | 订阅 |

## 💻 代码实现

### 1. 类型定义（src/types/types.ts）

```typescript
export type SubscriptionType = 'one_time' | 'monthly';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  age?: number;
  gender?: string;
  role: UserRole;
  has_paid: boolean;
  subscription_type?: SubscriptionType;  // ← 订阅类型字段
  subscription_expires_at?: string;      // ← 到期时间字段
  created_at: string;
  updated_at: string;
}
```

### 2. 判断逻辑（src/components/common/Header.tsx）

```typescript
// 第37行：从AuthContext获取用户资料
const { user, profile, refreshProfile } = useAuth();

// 第92行：判断是否有订阅
const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;

// 第201-211行：根据订阅状态显示不同按钮
{hasSubscription ? (
  // 已订阅：显示退订按钮
  <DropdownMenuItem onClick={() => setShowUnsubscribeDialog(true)}>
    <Bell className="mr-2 h-4 w-4" />
    <span>{language === 'zh' ? '退订' : 'Unsubscribe'}</span>
  </DropdownMenuItem>
) : (
  // 未订阅：显示订阅按钮
  <DropdownMenuItem onClick={() => navigate('/payment')}>
    <CreditCard className="mr-2 h-4 w-4" />
    <span>{language === 'zh' ? '订阅' : 'Subscribe'}</span>
  </DropdownMenuItem>
)}
```

### 3. 取消订阅API（src/db/api.ts）

```typescript
// 第36-48行：取消订阅函数
export async function cancelSubscription(userId: string) {
  const { data, error } = await supabase
    .from('profiles')  // ← 操作profiles表
    .update({
      subscription_type: null,           // ← 清空订阅类型
      subscription_expires_at: null,     // ← 清空到期时间
    })
    .eq('id', userId)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}
```

## 🔄 数据流程

### 订阅流程

1. **用户点击"订阅"按钮**
   - 跳转到 `/payment` 页面

2. **用户完成支付**
   - 更新 `profiles` 表
   - 设置 `subscription_type = 'monthly'`
   - 设置 `subscription_expires_at = 当前时间 + 30天`

3. **UI自动更新**
   - `hasSubscription` 变为 `true`
   - 显示"退订"按钮

### 退订流程

1. **用户点击"退订"按钮**
   - 打开确认对话框

2. **用户确认退订**
   - 调用 `cancelSubscription(userId)` API
   - 更新 `profiles` 表
   - 设置 `subscription_type = NULL`
   - 设置 `subscription_expires_at = NULL`

3. **刷新用户资料**
   - 调用 `refreshProfile()` 函数
   - 重新获取用户数据

4. **UI自动更新**
   - `hasSubscription` 变为 `false`
   - 显示"订阅"按钮

## 📝 数据库表结构

### profiles表完整结构

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  role user_role NOT NULL DEFAULT 'user'::user_role,
  has_paid BOOLEAN DEFAULT FALSE,
  subscription_type subscription_type,           -- ← 订阅类型
  subscription_expires_at TIMESTAMPTZ,           -- ← 到期时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 相关枚举类型

```sql
-- 订阅类型枚举
CREATE TYPE subscription_type AS ENUM ('one_time', 'monthly');

-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

## 🔍 查询示例

### 查询用户订阅状态

```sql
-- 查询所有月度订阅用户
SELECT id, email, subscription_type, subscription_expires_at
FROM profiles
WHERE subscription_type = 'monthly'
  AND subscription_expires_at IS NOT NULL;

-- 查询订阅已过期的用户
SELECT id, email, subscription_type, subscription_expires_at
FROM profiles
WHERE subscription_type = 'monthly'
  AND subscription_expires_at < NOW();

-- 查询未订阅的用户
SELECT id, email, subscription_type, subscription_expires_at
FROM profiles
WHERE subscription_type IS NULL
   OR subscription_expires_at IS NULL;
```

### 更新订阅状态

```sql
-- 设置月度订阅（30天）
UPDATE profiles
SET subscription_type = 'monthly',
    subscription_expires_at = NOW() + INTERVAL '30 days',
    updated_at = NOW()
WHERE id = 'user-uuid-here';

-- 取消订阅
UPDATE profiles
SET subscription_type = NULL,
    subscription_expires_at = NULL,
    updated_at = NOW()
WHERE id = 'user-uuid-here';
```

## 🎨 UI展示

### 退订按钮（已订阅用户）

```tsx
<DropdownMenuItem onClick={() => setShowUnsubscribeDialog(true)}>
  <Bell className="mr-2 h-4 w-4" />
  <span>{language === 'zh' ? '退订' : 'Unsubscribe'}</span>
</DropdownMenuItem>
```

**特点**：
- 图标：Bell（铃铛）
- 文字：退订 / Unsubscribe
- 点击：打开确认对话框

### 订阅按钮（未订阅用户）

```tsx
<DropdownMenuItem onClick={() => navigate('/payment')}>
  <CreditCard className="mr-2 h-4 w-4" />
  <span>{language === 'zh' ? '订阅' : 'Subscribe'}</span>
</DropdownMenuItem>
```

**特点**：
- 图标：CreditCard（信用卡）
- 文字：订阅 / Subscribe
- 点击：跳转到支付页面

## 🔐 权限控制

### 数据访问权限

**RLS（Row Level Security）策略**：
- 用户只能查看和修改自己的订阅信息
- 管理员可以查看所有用户的订阅信息

### API权限

**cancelSubscription函数**：
- 需要用户认证（通过Supabase Auth）
- 只能取消自己的订阅
- 通过 `userId` 参数确保安全性

## 📊 业务规则

### 订阅类型说明

1. **一次性付费（one_time）**
   - 价格：$1.98
   - 权益：解锁完整IQ报告和证书
   - 不显示"退订"按钮

2. **月度订阅（monthly）**
   - 价格：$28.80/月
   - 权益：专业训练课程和定期测评
   - 显示"退订"按钮
   - 可随时取消

### 到期时间处理

- **设置订阅**：`subscription_expires_at = NOW() + 30天`
- **取消订阅**：`subscription_expires_at = NULL`
- **过期检查**：需要定期检查 `subscription_expires_at < NOW()`

## 🧪 测试场景

### 测试用例1：未订阅用户
```typescript
profile = {
  subscription_type: null,
  subscription_expires_at: null
}
// 预期：hasSubscription = false，显示"订阅"按钮
```

### 测试用例2：月度订阅用户
```typescript
profile = {
  subscription_type: 'monthly',
  subscription_expires_at: '2025-12-31T00:00:00Z'
}
// 预期：hasSubscription = true，显示"退订"按钮
```

### 测试用例3：一次性付费用户
```typescript
profile = {
  subscription_type: 'one_time',
  subscription_expires_at: null
}
// 预期：hasSubscription = false，显示"订阅"按钮
```

### 测试用例4：订阅类型为monthly但无到期时间
```typescript
profile = {
  subscription_type: 'monthly',
  subscription_expires_at: null
}
// 预期：hasSubscription = false，显示"订阅"按钮
```

## 📚 相关文件

### 核心文件
- `src/components/common/Header.tsx` - UI展示逻辑
- `src/db/api.ts` - 数据库操作函数
- `src/types/types.ts` - 类型定义
- `src/contexts/AuthContext.tsx` - 用户认证上下文

### 数据库文件
- `supabase/migrations/00001_create_initial_schema.sql` - 表结构定义

### 文档文件
- `USER_DROPDOWN_OPTIMIZATION.md` - 用户下拉列表优化文档
- `HEADER_OPTIMIZATION_SUMMARY.md` - Header优化总结

## 💡 注意事项

### 1. 数据一致性
- `subscription_type` 和 `subscription_expires_at` 应该同步更新
- 取消订阅时两个字段都应设置为 `NULL`

### 2. 时区处理
- `subscription_expires_at` 使用 `TIMESTAMPTZ` 类型
- 自动处理时区转换
- 比较时使用 `NOW()` 函数

### 3. 性能优化
- 使用索引加速查询
- 避免频繁刷新用户资料
- 使用Context缓存用户数据

### 4. 安全性
- 验证用户身份
- 使用RLS策略保护数据
- 防止SQL注入

## 🎉 总结

**订阅和退订按钮的展示逻辑使用：**

- **数据表**：`profiles`（用户档案表）
- **关键字段1**：`subscription_type`（订阅类型）
- **关键字段2**：`subscription_expires_at`（订阅到期时间）
- **判断逻辑**：`subscription_type === 'monthly' && subscription_expires_at` 存在
- **显示规则**：
  - 条件满足 → 显示"退订"按钮
  - 条件不满足 → 显示"订阅"按钮

---
文档创建时间：2025-12-13  
文档版本：1.0  
最后更新：2025-12-13
