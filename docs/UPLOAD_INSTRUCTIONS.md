# IQ题目图片上传说明

## 📦 上传准备

### 当前数据库状态
- 表名：`iq_questions`
- 题目数量：20道
- 每道题目有 `question_number`（1-20）和 `image_url` 字段

## 📝 图片命名规则

请将图片按以下规则命名：
- `1.jpg` 或 `1.png` → 对应 question_number = 1
- `2.jpg` 或 `2.png` → 对应 question_number = 2
- ...
- `20.jpg` 或 `20.png` → 对应 question_number = 20

支持的图片格式：`.jpg`, `.jpeg`, `.png`, `.webp`

## 📤 上传步骤

### 方式1：直接上传压缩包
1. 将所有图片打包成 `.zip` 格式
2. 上传到工作目录：`/workspace/app-876katbvqjgh/`
3. 告诉我压缩包的文件名

### 方式2：直接上传图片文件夹
1. 将图片文件夹上传到：`/workspace/app-876katbvqjgh/question_images/`
2. 告诉我已上传完成

## 🔄 处理流程

我会自动执行以下操作：
1. ✅ 解压缩文件（如果是zip）
2. ✅ 验证图片文件
3. ✅ 上传图片到 Supabase Storage
4. ✅ 更新 `iq_questions` 表中对应记录的 `image_url`
5. ✅ 生成上传报告

## 📋 示例文件结构

```
question_images.zip
├── 1.jpg
├── 2.jpg
├── 3.jpg
├── ...
└── 20.jpg
```

或

```
question_images/
├── 1.png
├── 2.png
├── 3.png
├── ...
└── 20.png
```

## ⚠️ 注意事项

1. 图片文件名必须是纯数字（1-20）
2. 每个数字对应一道题目
3. 如果某个题号的图片不存在，会跳过该题目
4. 上传会覆盖现有的图片URL

---

准备好后，请告诉我：
- 压缩包文件名，或
- 已将图片放在哪个目录
