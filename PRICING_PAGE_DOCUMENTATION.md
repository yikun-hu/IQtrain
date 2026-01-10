# 定价页面（Pricing Page）功能文档

## 📋 页面概述

### 页面名称
**Pricing Page** - 定价页面

### 页面路径
`/pricing`

### 页面用途
展示IQ Train的订阅计划选项，帮助用户选择最适合自己需求的订阅方案。

## 🎯 功能特性

### 1. 订阅计划展示

#### 双周订阅计划
**价格**：€14.99 / 2周

**特性**：
- 7天试用期，之后自动续订双周费计划
- 个性化 IQ 证书
- 全面的认知分析
- 完全访问开发工具

#### 月度订阅计划
**价格**：€29.99 / 月

**特性**：
- 长期提长的最大节省
- 完整的认知评估套件
- 20+ 小时专家指导课程
- 个性化支援路径

### 2. 订阅权益展示

展示用户订阅后将获得的5大核心权益：

1. **智商分析** 🎯
   - 您的智商力数及详细专项分析

2. **认知档案** 🧠
   - 完整的认知档案，揭示您的优势和自然思维模式

3. **大脑训练** 💪
   - 探索您心智能力的大脑训练

4. **多元测试** 📊
   - 更多关于智识、人际关系和个人成长的测试

5. **问题解决** 🔗
   - 自在解决您的问题和问题的强大维护链接

### 3. 常见问题（FAQ）

使用Accordion手风琴组件展示4个常见问题：

1. **如果我对该程序不满意该怎么办？**
   - 退款政策说明

2. **如何取消我的订阅？**
   - 取消流程说明

3. **智能测试需要多长时间？**
   - 测试时长和注意事项

4. **我可以在多个设备上访问 myIQ 吗？**
   - 多设备支持说明

## 🔄 用户流程

### 访问定价页面的方式

1. **从用户下拉菜单**
   - 未订阅用户点击"订阅"按钮
   - 自动跳转到 `/pricing` 页面

2. **直接访问**
   - 用户可以直接访问 `/pricing` URL

### 选择订阅计划流程

```
用户访问定价页面
    ↓
浏览订阅计划和权益
    ↓
点击"开始"按钮
    ↓
跳转到支付页面（/payment）
    ↓
完成支付流程
```

## 💻 技术实现

### 文件位置
`src/pages/PricingPage.tsx`

### 核心组件

#### 1. 定价卡片（Card）
```tsx
<Card className="relative hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>{计划标题}</CardTitle>
    <CardDescription>{价格信息}</CardDescription>
  </CardHeader>
  <CardContent>
    {特性列表}
  </CardContent>
  <CardFooter>
    <Button onClick={handlePlanSelect}>开始</Button>
  </CardFooter>
</Card>
```

#### 2. 权益展示卡片
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent>
    <div className="flex items-start gap-4">
      <div className="text-3xl">{图标}</div>
      <p>{权益描述}</p>
    </div>
  </CardContent>
</Card>
```

#### 3. FAQ手风琴
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-0">
    <AccordionTrigger>{问题}</AccordionTrigger>
    <AccordionContent>{答案}</AccordionContent>
  </AccordionItem>
</Accordion>
```

### 状态管理

```typescript
const { language } = useLanguage();  // 语言上下文
const navigate = useNavigate();      // 路由导航
```

### 事件处理

```typescript
const handlePlanSelect = (planType: 'one_time' | 'monthly') => {
  // 跳转到支付页面，传递计划类型
  navigate('/payment', { state: { planType } });
};
```

## 🌐 多语言支持

### 中文内容
- 页面标题：探索我们的订阅选项，并选择最适合您需求的计划。
- 计划名称：双周订阅计划、每月年越
- 按钮文字：开始
- 权益标题：您将获得
- FAQ标题：常见问题

### 英文内容
- 页面标题：Explore our subscription options and choose the plan that best suits your needs.
- 计划名称：Bi-Weekly Subscription、Monthly Plan
- 按钮文字：Start
- 权益标题：What You Get
- FAQ标题：Frequently Asked Questions

### 内容结构

```typescript
const content = {
  zh: {
    title: '...',
    oneTime: { ... },
    monthly: { ... },
    benefits: [ ... ],
    faqs: [ ... ]
  },
  en: {
    title: '...',
    oneTime: { ... },
    monthly: { ... },
    benefits: [ ... ],
    faqs: [ ... ]
  }
};
```

## 🎨 UI设计

### 布局结构

```
页面容器（渐变背景）
├─ 页面标题
├─ 定价卡片网格（2列）
│  ├─ 双周订阅卡片
│  └─ 月度订阅卡片
├─ 免责声明
├─ 权益展示区域
│  └─ 权益卡片网格（3列）
└─ 常见问题区域
   └─ FAQ手风琴列表
```

### 响应式设计

- **桌面端（≥1280px）**：
  - 定价卡片：2列网格
  - 权益卡片：3列网格

- **移动端（<1280px）**：
  - 定价卡片：1列堆叠
  - 权益卡片：1列堆叠

### 样式特点

1. **渐变背景**
   ```tsx
   className="min-h-screen bg-gradient-to-b from-background to-muted"
   ```

2. **卡片悬停效果**
   ```tsx
   className="hover:shadow-lg transition-shadow"
   ```

3. **特性列表图标**
   - 使用 `Check` 图标（lucide-react）
   - 主题色（primary）

4. **月度计划突出显示**
   ```tsx
   className="border-primary"
   ```

## 🔗 路由配置

### 路由定义
```typescript
{
  name: 'Pricing',
  path: '/pricing',
  element: <PricingPage />,
}
```

### 导航方式

#### 从Header组件
```typescript
// src/components/common/Header.tsx
<DropdownMenuItem onClick={() => navigate('/pricing')}>
  <CreditCard className="mr-2 h-4 w-4" />
  <span>{language === 'zh' ? '订阅' : 'Subscribe'}</span>
</DropdownMenuItem>
```

#### 从定价页面到支付页面
```typescript
// src/pages/PricingPage.tsx
navigate('/payment', { state: { planType } });
```

## 📊 数据流

### 计划选择流程

```
用户点击"开始"按钮
    ↓
触发 handlePlanSelect(planType)
    ↓
navigate('/payment', { state: { planType } })
    ↓
支付页面接收 planType 参数
    ↓
显示对应的支付选项
```

### 计划类型

```typescript
type PlanType = 'one_time' | 'monthly';
```

- `'one_time'`：双周订阅计划
- `'monthly'`：月度订阅计划

## 🧪 测试场景

### 场景1：未登录用户访问
- 访问 `/pricing` 页面
- 查看订阅计划
- 点击"开始"按钮
- 跳转到支付页面

### 场景2：已登录未订阅用户
- 点击用户下拉菜单中的"订阅"按钮
- 跳转到定价页面
- 选择订阅计划
- 完成支付流程

### 场景3：语言切换
- 切换到中文
- 验证所有文本显示为中文
- 切换到英文
- 验证所有文本显示为英文

### 场景4：响应式测试
- 桌面端：2列定价卡片，3列权益卡片
- 移动端：1列堆叠布局
- 验证所有元素正常显示

### 场景5：FAQ交互
- 点击FAQ问题
- 验证答案展开/收起
- 验证一次只能展开一个问题

## 📁 相关文件

### 核心文件
- `src/pages/PricingPage.tsx` - 定价页面组件
- `src/routes.tsx` - 路由配置
- `src/components/common/Header.tsx` - 导航组件

### UI组件
- `src/components/ui/card.tsx` - 卡片组件
- `src/components/ui/button.tsx` - 按钮组件
- `src/components/ui/accordion.tsx` - 手风琴组件

### 上下文
- `src/contexts/LanguageContext.tsx` - 语言上下文

## 🎯 业务规则

### 订阅计划对比

| 特性 | 双周订阅 | 月度订阅 |
|------|---------|---------|
| 价格 | €14.99/2周 | €29.99/月 |
| 试用期 | 7天 | 无 |
| IQ证书 | ✓ | ✓ |
| 认知分析 | ✓ | ✓ |
| 开发工具 | ✓ | ✓ |
| 专家课程 | ✗ | ✓ (20+小时) |
| 个性化支援 | ✗ | ✓ |

### 价格说明
- 价格可能因国家和当地货币而异
- 用户将以当地货币付款
- 显示的价格为欧元（€）

## 💡 最佳实践

### 1. 用户体验
- 清晰的计划对比
- 突出显示推荐计划（月度计划）
- 提供详细的FAQ解答用户疑问

### 2. 视觉设计
- 使用卡片组件保持一致性
- 悬停效果增强交互感
- 图标和文字结合提升可读性

### 3. 性能优化
- 使用静态内容，无需API调用
- 响应式图片和布局
- 懒加载非关键内容

### 4. 可维护性
- 多语言内容集中管理
- 组件化设计便于复用
- 清晰的代码结构

## 🔄 未来优化方向

### 功能增强
1. 添加计划对比表格
2. 支持更多支付周期（季度、年度）
3. 添加用户评价展示
4. 实现优惠码功能

### 用户体验
1. 添加计划切换动画
2. 实现价格计算器
3. 添加"最受欢迎"标签
4. 提供试用倒计时

### 技术优化
1. 从后端获取价格数据
2. 实现A/B测试
3. 添加分析追踪
4. 优化SEO

## 📝 注意事项

### 1. 价格显示
- 确保价格与实际支付金额一致
- 考虑汇率变化
- 明确标注货币单位

### 2. 计划类型
- 与支付页面的计划类型保持一致
- 确保 `planType` 参数正确传递

### 3. 多语言
- 所有文本都需要翻译
- 保持中英文内容对应
- 注意文化差异

### 4. 响应式
- 测试所有断点
- 确保移动端可用性
- 优化触摸交互

## 🎉 总结

定价页面是用户订阅流程的关键入口，提供：

- **清晰的计划展示**：双周和月度两种选择
- **详细的权益说明**：5大核心权益
- **完善的FAQ**：解答用户疑问
- **流畅的用户体验**：从浏览到支付的完整流程
- **多语言支持**：中英文完整翻译
- **响应式设计**：适配所有设备

通过定价页面，用户可以充分了解订阅计划的价值，做出明智的选择。

---
文档创建时间：2025-12-13  
文档版本：1.0  
最后更新：2025-12-13
