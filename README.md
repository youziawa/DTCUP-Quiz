# 大唐杯刷题工具 (DTCUP Quiz)

一款基于 Vue 3 + Vite 开发的高效备考刷题工具，专为大唐杯通信竞赛设计。

> 本软件使用AI辅助开发

## 功能特点

### 📚 题库管理
- 支持导入/导出题库（JSON 格式）
- 可视化题库管理界面
- 支持单选题、多选题、判断题

### 🎯 练习模式
- **顺序练习**：按题库顺序依次答题
- **随机练习**：从题库中随机抽取 20 道题
- **巩固错题**：从错题库中随机抽取 10 道题进行巩固

### 📖 学习模式
- **做题模式**：答题后查看答案和解析
- **背题模式**：直接查看答案和解析

### 📊 数据统计
- 实时显示答题进度
- 正确率统计
- 错题记录功能

### 📝 练习历史
- 自动保存练习记录
- 支持查看历史练习详情
- 可查看每道题的答题情况和正确答案

### 💾 数据持久化
- 自动保存答题进度到本地存储
- 刷新页面后可继续上次练习

## 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **UI 组件库**：Element Plus
- **图标**：Element Plus Icons

## 项目结构

```
dtcup-quiz/
├── src/
│   ├── components/       # 公共组件
│   ├── data/            # 题库数据
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── views/           # 页面组件
│   │   ├── Home.vue         # 首页
│   │   ├── Quiz.vue         # 答题页面
│   │   ├── WrongNotes.vue   # 错题回顾
│   │   └── BankManage.vue   # 题库管理
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── package.json
└── vite.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 题库格式

题库采用 JSON 格式，结构如下：

```json
{
  "name": "题库名称",
  "questions": [
    {
      "type": "single",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": 0,
      "explanation": "解析内容"
    },
    {
      "type": "multiple",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": [0, 2],
      "explanation": "解析内容"
    },
    {
      "type": "judge",
      "question": "题目内容",
      "options": ["正确", "错误"],
      "answer": 0,
      "explanation": "解析内容"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 题目类型：`single`(单选)、`multiple`(多选)、`judge`(判断) |
| question | string | 题目内容 |
| options | array | 选项列表 |
| answer | number/array | 答案（单选/判断为数字，多选为数字数组） |
| explanation | string | 题目解析 |

### 答案索引

- 单选题/判断题：`0` 表示第一个选项，`1` 表示第二个选项，以此类推
- 多选题：`[0, 2]` 表示选择第一和第三个选项

## 使用说明

1. **开始刷题**：点击首页"开始刷题"按钮进入顺序练习
2. **随机练习**：点击"随机练习"从题库中随机抽取题目
3. **巩固错题**：完成练习后，可点击"巩固错题"专门练习错题
4. **切换模式**：答题过程中可切换"做题模式"和"背题模式"
5. **查看历史**：首页底部显示练习历史，可查看详情

## 许可证

MIT License
