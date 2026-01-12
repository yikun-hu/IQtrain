# 政策页面文档

## 概述

IQ Train网站现已包含完整的政策页面，支持中英双语，确保用户了解其权利和我们的服务条款。

## 已创建的页面

### 1. 隐私政策（Privacy Policy）
- **路径**: `/privacy-policy`
- **文件**: `src/pages/PrivacyPolicyPage.tsx`
- **内容包括**:
  - 收集的信息类型（个人信息、测试数据、支付信息、使用数据、技术数据）
  - 信息使用方式（提供服务、处理支付、个性化体验、分析改进、通讯、安全、法律合规）
  - 信息共享和披露（服务提供商、法律要求、业务转让、用户同意）
  - 数据安全措施（加密、安全认证、审计、访问控制、安全支付）
  - 用户权利（访问、更正、删除、退出、数据可移植性）
  - Cookie和跟踪技术
  - 儿童隐私（13岁及以上）
  - 国际数据传输
  - 政策变更通知
  - 联系方式

### 2. 用户协议（Terms of Service）
- **路径**: `/terms`
- **文件**: `src/pages/TermsPage.tsx`
- **内容包括**:
  - 接受条款
  - 服务描述（IQ测试、大脑训练、多元评估）
  - 账户注册和安全（13岁以上、准确信息、账户责任）
  - 定价和支付
    - 一次性付费：$1.98（完整IQ报告和证书）
    - 月度订阅：$28.80/月（专业训练课程和定期评估）
  - 退款政策
    - 一次性付费：报告生成后不可退款
    - 月度订阅：可随时取消，7天内可申请退款
  - 用户行为规范
  - 知识产权保护
  - 测试结果和准确性说明
  - 订阅管理
  - 服务修改和终止
  - 免责声明
  - 责任限制
  - 适用法律
  - 条款变更
  - 联系信息

### 3. Cookie政策（Cookie Policy）
- **路径**: `/cookie-policy`
- **文件**: `src/pages/CookiePolicyPage.tsx`
- **内容包括**:
  - Cookie定义和作用
  - Cookie类型
    - 必要Cookie（安全、认证、会话管理）
    - 功能Cookie（偏好、语言、测试进度）
    - 性能和分析Cookie（用户行为、改进服务、效果衡量）
  - Cookie使用方式（认证安全、用户体验、分析改进）
  - 第三方Cookie（PayPal、分析服务）
  - 管理Cookie（浏览器设置、Cookie偏好）
  - Cookie持续时间（会话Cookie、持久Cookie）
  - 请勿跟踪信号
  - 政策更新
  - 联系方式

## 访问入口

### 1. Footer（页脚）
所有页面的页脚都包含以下链接：
- 隐私政策（Privacy Policy）
- 用户协议（Terms of Service）
- Cookie政策（Cookie Policy）

### 2. Header用户下拉菜单
登录用户可以通过右上角的用户图标下拉菜单访问：
- 账户信息
- **隐私政策**
- **用户协议**
- **Cookie政策**
- 退订
- 登出

## 多语言支持

所有政策页面都支持中英双语：
- **英文（English）**: 完整的英文版本
- **中文（Chinese）**: 完整的中文版本

语言切换方式：
1. 通过Header右上角的语言选择器
2. 通过Footer的语言选择器

## 设计特点

### 1. 统一的视觉风格
- 使用Card组件包裹内容
- 清晰的标题层级
- 良好的间距和排版
- 响应式设计，适配各种设备

### 2. 易读性
- 使用合适的字体大小
- 清晰的段落分隔
- 重要信息突出显示
- 支持长文本的舒适阅读

### 3. 导航便利性
- 页面顶部显示标题和最后更新日期
- 内容分节清晰
- 可通过多个入口访问

## 法律合规性

### 1. 数据保护
- 符合GDPR要求
- 明确说明数据收集和使用
- 用户权利清晰列出

### 2. 透明度
- 详细说明服务条款
- 明确的定价和退款政策
- Cookie使用完全透明

### 3. 用户权利
- 访问个人数据的权利
- 更正和删除数据的权利
- 退出营销通讯的权利
- 数据可移植性

## 联系方式

政策相关问题联系：
- 隐私问题：privacy@iqtrain.com
- 服务条款：support@iqtrain.com
- Cookie问题：privacy@iqtrain.com

## 维护和更新

### 更新流程
1. 修改对应的页面文件
2. 更新"最后更新"日期
3. 如有重大变更，通知用户

### 文件位置
- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/pages/CookiePolicyPage.tsx`

### 路由配置
- `src/routes.tsx` - 包含所有政策页面的路由配置

### 链接位置
- `src/components/layouts/Footer.tsx` - Footer中的政策链接
- `src/components/common/Header.tsx` - 用户下拉菜单中的政策链接

## 技术实现

### 组件结构
```tsx
<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <p>{lastUpdated}</p>
  </CardHeader>
  <CardContent>
    {sections.map(section => (
      <div>
        <h2>{section.title}</h2>
        <p>{section.content}</p>
      </div>
    ))}
  </CardContent>
</Card>
```

### 多语言实现
使用LanguageContext提供的language状态：
```tsx
const { language } = useLanguage();
const currentContent = language === 'zh' ? content.zh : content.en;
```

## 总结

IQ Train网站现已具备完整的政策页面体系，确保：
✅ 法律合规性
✅ 用户知情权
✅ 透明的服务条款
✅ 清晰的隐私保护
✅ 完整的Cookie说明
✅ 中英双语支持
✅ 多个访问入口
✅ 良好的用户体验
