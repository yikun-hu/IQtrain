# 🐛 Bug修复总结

## 问题描述
**错误信息**：`Uncaught TypeError: Cannot read properties of null (reading 'useMemo')`

**错误位置**：Header组件中的AlertDialog

## 根本原因
AlertDialog组件被错误地放置在`<header>`标签内部，导致React Context无法正确初始化。

## 解决方案
将AlertDialog组件从header内部移到外部，使其与header平级。

### 修改前
```tsx
return (
  <header>
    {/* Header内容 */}
    <AlertDialog>...</AlertDialog>  ❌ 错误位置
  </header>
);
```

### 修改后
```tsx
return (
  <>
    <header>
      {/* Header内容 */}
    </header>
    <AlertDialog>...</AlertDialog>  ✅ 正确位置
  </>
);
```

## 技术要点
- **Portal组件**必须与页面主要内容平级
- 不要将Portal组件嵌套在语义化HTML标签（header、main、footer等）内部
- 使用Fragment（`<>...</>`）包裹多个顶级元素

## 验证结果
- ✅ Lint检查通过
- ✅ 对话框正常显示
- ✅ 功能完全正常
- ✅ 无控制台错误

## 相关文件
- `src/components/common/Header.tsx`

## 经验教训
Portal组件（AlertDialog、Dialog、Popover等）应该始终与页面主要内容平级，而不是嵌套在其他元素内部。

---
修复时间：2025-12-13
修复状态：✅ 已完成
