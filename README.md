# 🎬 AI互动影视游戏 - Interactive Drama Game

一个由大模型AI驱动的互动故事游戏平台，支持单人×单AI、单人×多AI、多用户×多AI的剧本试玩，并提供Prompt调试和多模型效果对比功能。

## ✨ 核心功能

### 1. 📚 剧本大厅系统
- **剧本列表展示** - 精美的剧本卡片展示
- **剧本分类** - 支持按类型筛选（单人单AI、单人多AI、多用户多AI）
- **剧本筛选** - 按难度、游玩时间等筛选
- **剧本详情** - 完整的剧本信息、角色和背景介绍

### 2. 🎭 剧本详情页
- **剧本简介** - 详细的故事描述
- **角色信息** - 每个角色的性格、目标、背景
- **故事背景** - 沉浸式的世界观介绍
- **AI角色选择** - 支持单选或多选AI角色

### 3. 🎮 游戏交互系统
- **初始场景** - 精心设计的开场场景
- **3个预置选项** - 开放式的选择点
- **用户输入** - 支持自定义行动描述
- **AI生成故事** - 实时生成下一段剧情
- **对话展示** - 完整的对话历史记录

### 4. 🔧 开发者模式

#### 调试模式
- 测试单个Prompt的效果
- 调整温度参数（创意度）
- 查看Token消耗
- 保存测试历史

#### 对比模式
- 同时测试多个模型
- 并行处理，快速对比结果
- 查看响应时间和Token成本
- 模型性能分析

## 🚀 技术栈

### 后端
- **框架**: Express.js + TypeScript
- **API**: RESTful
- **AI集成**: OpenAI API
- **服务**: 
  - 剧本管理服务
  - AI故事生成服务
  - 开发者工具服务

### 前端
- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: Zustand
- **HTTP客户端**: Axios

## 📦 项目结构

```
interactive-drama-game/
├── backend/
│   ├── src/
│   │   ├── index.ts           # 服务器入口
│   │   ├── types.ts           # TypeScript 类型定义
│   │   ├── services/
│   │   │   ├── scriptService.ts    # 剧本管理
│   │   │   └── aiService.ts        # AI 集成
│   │   └── routes/
│   │       ├── scripts.ts     # 剧本 API
│   │       ├── game.ts        # 游戏会话 API
│   │       └── dev.ts         # 开发者工具 API
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── layout.tsx         # 根布局
    │   ├── page.tsx           # 首页
    │   ├── globals.css        # 全局样式
    │   ├── script/
    │   │   └── [id]/
    │   │       └── page.tsx   # 剧本详情页
    │   └── game/
    │       └── [sessionId]/
    │           └── page.tsx   # 游戏页面
    ├── components/
    │   └── game/
    │       ├── GamePlayMode.tsx    # 正常游玩模式
    │       ├── DebugMode.tsx       # 调试模式
    │       ├── CompareMode.tsx     # 对比模式
    │       ├── DialogueDisplay.tsx # 对话展示
    │       └── ChoiceButtons.tsx   # 选择按钮
    ├── lib/
    │   ├── api.ts             # API 客户端
    │   └── store.ts           # 状态管理
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    └── .env.example
```

## 🛠️ 安装和运行

### 前置要求
- Node.js 18+
- npm 或 yarn
- OpenAI API Key（用于AI功能）

### 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，添加你的 OpenAI API Key
# OPENAI_API_KEY=sk-xxx

# 开发模式运行
npm run dev

# 或者生产模式构建
npm run build
npm start
```

服务器将在 `http://localhost:3001` 启动

### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 开发模式运行
npm run dev

# 或者生产模式构建
npm run build
npm start
```

应用将在 `http://localhost:3000` 启动

## 🎮 使用流程

### 1. 浏览剧本
1. 打开首页，查看所有可用剧本
2. 使用分类过滤器查找特定类型的剧本
3. 点击剧本卡片查看详情

### 2. 选择角色并开始游戏
1. 在剧本详情页选择你想互动的AI角色
2. 选择游戏模式：
   - 🎮 **正常游玩** - 完整的游戏体验
   - 🔧 **调试模式** - 测试Prompt效果
   - ⚖️ **对比模式** - 多模型对比

### 3. 游戏交互
1. 阅读故事叙述和AI角色的回应
2. 选择预置选项或输入自定义行动
3. AI根据你的选择生成下一个故事段落
4. 查看完整的对话历史

### 4. 开发者模式（可选）

#### 调试模式
- 打开开发者面板
- 输入想要测试的Prompt
- 调整温度参数
- 查看AI的响应和Token消耗

#### 对比模式
- 选择2个或多个模型
- 输入测试Prompt
- 对比不同模型的响应
- 分析性能和创意度

## 📊 API 端点

### 剧本 API (`/api/scripts`)
- `GET /` - 获取所有剧本
- `GET /:scriptId` - 获取剧本详情
- `GET /:scriptId/characters` - 获取角色列表
- `GET /:scriptId/initial-scene` - 获取初始场景

### 游戏会话 API (`/api/game`)
- `POST /sessions` - 创建新会话
- `GET /sessions/:sessionId` - 获取会话信息
- `POST /sessions/:sessionId/choose` - 提交选择
- `GET /sessions/:sessionId/history` - 获取对话历史

### 开发者工具 API (`/api/dev`)
- `POST /debug` - 测试单个Prompt
- `POST /compare` - 对比多个模型
- `GET /models` - 获取可用模型列表
- `POST /debug-session` - 创建调试会话
- `POST /debug-session/:id/test` - 添加测试
- `GET /debug-session/:id` - 获取调试结果

## 🎨 UI设计特点

- **深色主题** - 沉浸式的游戏体验
- **渐变设计** - 现代化的视觉效果
- **流畅动画** - Framer Motion 驱动的交互
- **响应式布局** - 适配所有屏幕尺寸
- **可访问性** - 遵循无障碍设计原则

## 🔐 环境变量配置

### 后端 (.env)
```
OPENAI_API_KEY=your_api_key
PORT=3001
NODE_ENV=development
```

### 前端 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📝 示例数据

系统包含预置的示例剧本：
- 🕵️ **暗影特务** - 谍战冒险（单人×多AI）
- 🧙 **魔法学院** - 奇幻冒险（单人×单AI）

## 🚧 后续功能（计划中）

- [ ] 数据库集成（MongoDB）
- [ ] 用户账户系统
- [ ] 剧本创意工具
- [ ] 多语言支持
- [ ] 云存储游戏进度
- [ ] 社区分享功能
- [ ] 实时多人协作
- [ ] 更多AI模型集成

## 🤝 贡献

欢迎提交问题和拉取请求！

## 📄 许可证

MIT License

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- Email: support@dramagame.ai

---

**由AI驱动的创意故事体验** 🎬✨

