# 🏗️ 系统架构文档

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     用户浏览器端 (3000)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          Next.js 前端应用 (React 18 + TypeScript)        │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 页面层 (Pages)                                      │ │  │
│  │  │ • Home (/)                - 剧本大厅               │ │  │
│  │  │ • ScriptDetail (/script/:id) - 剧本详情           │ │  │
│  │  │ • GamePlay (/game/:sessionId) - 游戏交互          │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 组件层 (Components)                                 │ │  │
│  │  │ • GamePlayMode - 正常游玩模式                      │ │  │
│  │  │ • DebugMode - Prompt调试模式                       │ │  │
│  │  │ • CompareMode - 多模型对比模式                     │ │  │
│  │  │ • DialogueDisplay - 对话展示                       │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 状态管理 (Zustand Store)                            │ │  │
│  │  │ • GameStore - 游戏状态                             │ │  │
│  │  │ • ScriptStore - 剧本状态                           │ │  │
│  │  │ • DevStore - 开发者工具状态                        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ API 客户端层 (Axios)                                │ │  │
│  │  │ • scriptApi - 剧本 API                             │ │  │
│  │  │ • gameApi - 游戏会话 API                           │ │  │
│  │  │ • devApi - 开发者工具 API                          │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                         HTTP/JSON
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    后端服务器 (3001)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Express.js 服务器 (Node.js + TypeScript)          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 路由层 (Routes)                                      │ │  │
│  │  │ • /api/scripts/* - 剧本管理                         │ │  │
│  │  │ • /api/game/* - 游戏会话管理                        │ │  │
│  │  │ • /api/dev/* - 开发者工具                           │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 业务逻辑层 (Services)                                │ │  │
│  │  │ • ScriptService                                     │ │  │
│  │  │   - 剧本 CRUD                                       │ │  │
│  │  │   - 角色管理                                        │ │  │
│  │  │   - 场景管理                                        │ │  │
│  │  │                                                      │ │  │
│  │  │ • AIService                                         │ │  │
│  │  │   - Prompt 构建                                     │ │  │
│  │  │   - 故事生成                                        │ │  │
│  │  │   - 模型调用                                        │ │  │
│  │  │   - 多模型对比                                      │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 数据层 (In-Memory Storage)                           │ │  │
│  │  │ • Scripts Map                                       │ │  │
│  │  │ • Characters Map                                    │ │  │
│  │  │ • Scenes Map                                        │ │  │
│  │  │ • GameSessions Map                                  │ │  │
│  │  │ • DebugSessions Map                                 │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                      HTTPS / REST API
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    外部服务 (Third-party)                       │
│  • OpenAI API - GPT-4, GPT-3.5-Turbo 模型调用                 │
│  • Anthropic Claude API - 未来扩展                            │
└─────────────────────────────────────────────────────────────────┘
```

## 核心数据流

### 1. 游戏初始化流程

```
用户浏览首页
    ↓
scriptApi.getAllScripts()
    ↓
后端: GET /api/scripts
    ↓
ScriptService.getAllScripts()
    ↓
返回剧本列表
    ↓
前端展示剧本卡片
```

### 2. 游戏开始流程

```
用户选择剧本和角色
    ↓
选择游戏模式
    ↓
gameApi.createSession()
    ↓
后端: POST /api/game/sessions
    ↓
GameSession 创建
    ↓
初始化游戏状态
    ↓
前端跳转到游戏页面
```

### 3. 游戏交互流程

```
用户选择或输入行动
    ↓
gameApi.submitChoice()
    ↓
后端: POST /api/game/sessions/:id/choose
    ↓
AIService.generateStoryline()
    ↓
    ├─ 构建系统提示词 (buildSystemPrompt)
    ├─ 构建用户提示词 (buildUserPrompt)
    └─ 调用 OpenAI API
         ↓
    OpenAI 生成响应
    ↓
解析 AI 响应
    ↓
更新 GameSession
    ↓
返回新场景和选择
    ↓
前端更新游戏状态
    ↓
显示新叙述和选择
```

### 4. 调试模式流程

```
开发者输入 Prompt
    ↓
选择模型和温度
    ↓
devApi.debugPrompt()
    ↓
后端: POST /api/dev/debug
    ↓
AIService.debugPrompt()
    ↓
调用选定模型
    ↓
返回响应和 Token 数
    ↓
前端显示结果
```

### 5. 对比模式流程

```
开发者选择多个模型
    ↓
输入 Prompt
    ↓
devApi.compareModels()
    ↓
后端: POST /api/dev/compare
    ↓
AIService.compareModels()
    ↓
并行调用多个模型
    ↓
    ├─ 模型1 → 响应1
    ├─ 模型2 → 响应2
    └─ 模型N → 响应N
    ↓
汇总结果
    ↓
返回所有响应、时间和 Token
    ↓
前端对比展示
```

## 类型系统

### 核心实体

```typescript
// 剧本
Script {
  id: string
  title: string
  category: 'single-single' | 'single-multi' | 'multi-multi'
  backgroundStory: string
  difficulty: 'easy' | 'normal' | 'hard'
  estimatedPlayTime: number
}

// 角色
Character {
  id: string
  scriptId: string
  name: string
  personality: string
  goal: string
  systemPrompt: string  // AI角色的系统提示
}

// 游戏会话
GameSession {
  id: string
  scriptId: string
  userId: string
  selectedCharacters: string[]
  mode: 'normal' | 'debug' | 'compare'
  currentSceneId: string
  dialogueHistory: DialogueEntry[]
  status: 'ongoing' | 'completed' | 'abandoned'
}

// 对话条目
DialogueEntry {
  id: string
  characterId: string
  characterName: string
  content: string
  type: 'user-input' | 'ai-response' | 'narrative'
  modelUsed?: string
}
```

## Prompt 工程

### 系统提示词模板

```
你是一个互动影视游戏的故事生成器。

游戏背景：[背景信息]

参与的角色：
- 角色1：[性格]，目标：[目标]
- 角色2：[性格]，目标：[目标]

你的任务是：
1. 根据用户选择生成有趣的故事段落
2. 生成2-3个新的选择选项
3. 保持故事连贯性
4. 响应格式为 JSON
```

### 用户提示词模板

```
用户选择了：[用户行动]

请基于这个选择，生成故事的下一步。
```

## API 响应格式

### 成功响应
```json
{
  "success": true,
  "data": { /* 实际数据 */ }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述"
}
```

## 状态管理流程

```
Zustand Store
├── GameStore
│   ├── userId - 用户 ID
│   ├── currentSessionId - 当前会话
│   ├── gameMode - 游戏模式
│   ├── currentNarrative - 当前叙述
│   ├── choices - 可选选择
│   ├── dialogueHistory - 对话历史
│   ├── isLoading - 加载状态
│   └── error - 错误信息
│
├── ScriptStore
│   ├── scripts - 剧本列表
│   ├── selectedScript - 已选择的剧本
│   ├── selectedCharacters - 已选择的角色
│   └── isLoadingScripts - 加载状态
│
└── DevStore
    ├── debugSessionId - 调试会话 ID
    ├── debugResponses - 调试响应列表
    ├── compareResults - 对比结果
    ├── customPrompt - 自定义提示词
    ├── selectedModel - 选定的模型
    ├── availableModels - 可用模型列表
    └── isDevMode - 开发者模式切换
```

## 性能考虑

### 前端优化
- 使用 Framer Motion 实现流畅动画
- Zustand 提供高效状态管理
- Next.js 图片优化
- 响应式设计避免重排

### 后端优化
- 内存存储用于快速数据访问
- 流式 AI 响应处理
- 并行模型调用
- 错误重试机制

### 扩展建议
- 数据库：集成 MongoDB 或 PostgreSQL
- 缓存：Redis 缓存热门剧本
- 消息队列：处理长时间运行的任务
- CDN：静态资源分发

## 安全考虑

- 环境变量保存敏感信息（API Key）
- CORS 配置限制跨域请求
- 输入验证和清理
- Rate limiting 防止滥用
- 错误消息不泄露内部细节

## 扩展点

### 添加新模型
1. 在 AIService 中初始化新模型
2. 在 devApi.getAvailableModels() 中注册
3. 在对比模式中选择

### 添加新剧本
1. 在 ScriptService.initializeSampleData() 中定义
2. 创建对应的角色和场景

### 自定义主题
1. 修改 tailwind.config.ts 颜色
2. 更新 globals.css 样式
3. 调整组件的 className

---

**架构设计考虑了可扩展性、可维护性和用户体验** 🎨

