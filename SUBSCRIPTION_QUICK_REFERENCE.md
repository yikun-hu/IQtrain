# 订阅按钮展示逻辑 - 快速参考

## 📋 核心信息

### 数据表
**`profiles`** 表

### 关键字段
1. **`subscription_type`** - 订阅类型（ENUM: 'one_time' | 'monthly' | NULL）
2. **`subscription_expires_at`** - 订阅到期时间（TIMESTAMPTZ）

## 🎯 判断逻辑

```typescript
// 位置：src/components/common/Header.tsx 第92行
const hasSubscription = profile?.subscription_type === 'monthly' && profile?.subscription_expires_at;
```

### 显示规则

| 条件 | 显示按钮 |
|------|----------|
| `subscription_type === 'monthly'` **且** `subscription_expires_at` 存在 | **退订** |
| 其他所有情况 | **订阅** |

## 📊 场景示例

```typescript
// ✅ 显示"退订"按钮
{ subscription_type: 'monthly', subscription_expires_at: '2025-12-31T00:00:00Z' }

// ❌ 显示"订阅"按钮
{ subscription_type: 'monthly', subscription_expires_at: null }
{ subscription_type: 'one_time', subscription_expires_at: '2025-12-31T00:00:00Z' }
{ subscription_type: null, subscription_expires_at: null }
```

## 🔄 API函数

### 取消订阅
```typescript
// src/db/api.ts
cancelSubscription(userId: string)
// 操作：将 subscription_type 和 subscription_expires_at 设置为 NULL
```

## 📁 相关文件

- **UI逻辑**：`src/components/common/Header.tsx`
- **API函数**：`src/db/api.ts`
- **类型定义**：`src/types/types.ts`
- **数据库表**：`supabase/migrations/00001_create_initial_schema.sql`

## 📖 详细文档

查看 `SUBSCRIPTION_LOGIC_DOCUMENTATION.md` 获取完整技术文档。

---
快速参考 | 2025-12-13
