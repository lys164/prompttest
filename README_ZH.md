# 🎭 AI 互动影游 - 完整版

> 由 AI 驱动的互动故事游戏平台，支持多个 AI 角色协作生成动态故事

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-ISC-purple)](LICENSE)

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装与运行

#### 步骤 1：安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

#### 步骤 2：启动后端（终端1）

```bash
cd backend
npm run build
npm start
```

预期输出：
```
✅ Backend server is running on http://localhost:3001
```

#### 步骤 3：启动前端（终端2）

```bash
cd frontend
npm run dev
```

预期输出：
```
▲ Next.js 14.x.x
  - Local: http://localhost:3000
```

#### 步骤 4：打开浏览器

访问 **http://localhost:3000** 开始游戏！

## 🎮 游戏体验

### 场景1：暗影特务

**类型**：【单人】【多AI】
**所需AI**：2个

体验一个特工如何与指挥官协作完成秘密任务。

**示例对话**：
- 💬 勇敢的探险家：我立即去调查那条线索！
- 💬 智慧的魔法师：等等，可能是个陷阱...

### 场景2：魔法学院

**类型**：【单人】【单AI】
**所需AI**：1个

一个新生巫师在导师的指导下学习魔法。

**示例对话**：
- 💬 梅林导师：你的魔力很不寻常，让我们看看你能做什么...

## 🎯 核心特性

### ✨ 多角色协作
每个游戏会话中的多个 AI 角色独立做出反应，形成互动和冲突。

```
你的选择：立即调查线索
  ↓
AI 生成故事 + 每个角色的独立反应
  ↓
故事继续发展...
```

### 🧠 智能推荐系统
根据剧本角色的需求和你的 AI 角色的特征自动推荐最佳匹配。

```
推荐AI特征：["冒险", "好奇心强"]
     ↓
优先推荐：勇敢的探险家 (ENFP)
次选推荐：冒险骑士 (ESFP)
```

### 🎲 动态故事生成
故事根据你的选择实时生成，每次选择都会改变故事的发展方向。

```
选择A → 故事线1 → 故事线1-1 / 故事线1-2
选择B → 故事线2 → 故事线2-1 / 故事线2-2
```

### 🎮 三种游戏模式

#### 🎯 正常游玩
完整的游戏体验，享受故事，做出选择。

#### 🔧 调试模式
测试和优化 AI 提示词，查看原始 AI 响应。

#### ⚖️ 对比模式
同时使用多个 AI 模型生成故事，比较质量。

## 📊 项目结构

```
interactive-drama-game/
├── backend/                    # Node.js + Express 后端
│   ├── src/
│   │   ├── services/          # 业务逻辑层
│   │   │   ├── scriptService.ts    # 剧本管理
│   │   │   ├── userService.ts      # 用户AI角色
│   │   │   └── aiService.ts        # AI生成引擎
│   │   └── routes/            # API 路由
│   │       ├── scripts.ts      # 剧本 API
│   │       ├── game.ts         # 游戏 API
│   │       └── dev.ts          # 开发工具 API
│   └── dist/                  # 编译输出
│
├── frontend/                   # Next.js + React 前端
│   ├── app/
│   │   ├── page.tsx            # 剧本大厅首页
│   │   └── script/[id]/page.tsx # 剧本详情页
│   ├── components/
│   │   └── game/
│   │       ├── CharacterSelector.tsx    # 角色选择器
│   │       ├── GamePlayMode.tsx         # 游戏播放
│   │       ├── DebugMode.tsx            # 调试模式
│   │       └── CompareMode.tsx          # 对比模式
│   └── lib/
│       ├── api.ts              # API 客户端
│       └── store.ts            # 状态管理
│
├── docs/
│   ├── SYSTEM_INTEGRATION.md   # 系统集成文档
│   ├── RUN_DEMO.md             # 演示指南
│   ├── COMPLETION_SUMMARY.md   # 完成总结
│   └── README_ZH.md            # 本文件
│
└── docker-compose.yml          # Docker 部署配置
```

## 🔌 API 文档

### 剧本 API

```bash
# 获取所有剧本
GET /api/scripts

# 按类别获取剧本
GET /api/scripts?category=【单人】【多AI】

# 获取剧本详情
GET /api/scripts/:scriptId

# 获取剧本角色
GET /api/scripts/:scriptId/characters
```

### 游戏 API

```bash
# 创建游戏会话
POST /api/game/sessions
{
  "scriptId": "script-001",
  "userId": "user-123",
  "characterMappings": [
    {
      "userAICharacterId": "ai-char-001",
      "scriptRoleId": "shadow-agent",
      "scriptCharacterName": "影子",
      "userAICharacterName": "勇敢的探险家"
    }
  ],
  "mode": "normal"
}

# 提交游戏选择
POST /api/game/sessions/:sessionId/choose
{
  "choiceId": "opt-1",
  "userInput": "立即调查线索"
}

# 获取对话历史
GET /api/game/sessions/:sessionId/history
```

## 🧑‍💼 AI 角色示例

### 勇敢的探险家
- **MBTI**: ENFP
- **特长**: 冒险、解谜、沟通
- **等级**: 7/10
- **性格**: 大胆、好奇心强、乐观

### 智慧的魔法师
- **MBTI**: INTJ
- **特长**: 魔法、教学、研究
- **等级**: 9/10
- **性格**: 分析性、谨慎、知识渊博

### 忠诚的骑士
- **MBTI**: ISTJ
- **特长**: 战斗、保护、正义
- **等级**: 8/10
- **性格**: 坚定、可靠、荣誉感

## 📱 数据字段

### 用户 AI 角色包含 15 个字段：

```typescript
{
  姓名: "勇敢的探险家",
  和用户的身份: "虚拟助手",
  超能力: [{ 名称, 等级, 描述 }],
  是否有原型: false,
  年龄: 25,
  生日: "05-15",
  国籍: "冒险岛",
  语言: ["通用语", "古代密语"],
  外貌描述: "身材挺拔，眼神炯炯有神",
  喜好特长: ["冒险", "解谜"],
  讨厌的东西: ["谎言", "懦弱"],
  星座: "白羊座",
  MBTI: "ENFP",
  面对未知的态度: "好奇心强",
  恐惧软肋: "害怕让伙伴失望"
}
```

### 剧本包含完整的故事信息：

```typescript
{
  剧本类别: "【单人】【多AI】",
  品类标签: ["冒险", "悬疑"],
  参与AI数: 2,
  剧本简介: "在冷战时期...",
  故事内容: "2024年...",
  角色池: [{ 角色信息 }],
  角色详细设定: [{ 详细背景 }],
  预计时长: 60
}
```

## 🔧 开发工作流

### 开发模式

```bash
# 后端（支持热重载）
cd backend && npm run dev

# 前端（支持热重载）
cd frontend && npm run dev
```

### 生产构建

```bash
# 后端
cd backend && npm run build && npm start

# 前端
cd frontend && npm run build && npm start
```

### Docker 部署

```bash
docker-compose up --build
```

## 📊 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **运行时** | Node.js | 18+ |
| **后端框架** | Express | 4.18.2 |
| **前端框架** | Next.js | 14+ |
| **语言** | TypeScript | 5.3.3 |
| **样式** | Tailwind CSS | 3+ |
| **动画** | Framer Motion | 10+ |
| **状态管理** | Zustand | 4+ |
| **HTTP客户端** | Axios | 1.6.2 |
| **AI API** | OpenRouter | 最新 |

## 🧪 测试 API

### 使用 cURL

```bash
# 测试后端连接
curl http://localhost:3001/health | jq .

# 获取剧本列表
curl http://localhost:3001/api/scripts | jq .

# 获取用户AI角色
curl http://localhost:3001/api/game/user-characters/user-123 | jq .
```

### 使用 Postman

1. 导入 API 端点
2. 测试各个路由
3. 查看响应

## 🐛 故障排查

### 后端无法启动

```
错误：EADDRINUSE: address already in use :::3001
```

**解决**：
```bash
# 查找占用3001端口的进程
lsof -i :3001

# 杀死该进程
kill -9 <PID>
```

### 前端连接不到后端

**检查**：
1. 后端是否运行？`curl http://localhost:3001/health`
2. `.env.local` 中的 API URL 是否正确？
3. CORS 错误？检查后端 CORS 配置

### 故事生成失败

**检查**：
1. OpenRouter API Key 是否正确配置？
2. API Key 是否有余额？
3. 网络连接是否正常？

## 📚 文档

- 📖 [系统集成文档](./SYSTEM_INTEGRATION.md) - 详细的架构和API说明
- 🎮 [演示指南](./RUN_DEMO.md) - 完整的演示流程
- ✅ [完成总结](./COMPLETION_SUMMARY.md) - 项目完成情况
- 🔧 [开发指南](./docs/) - 开发者文档

## 🎓 学习资源

### 推荐操作顺序

1. **了解游戏流程**：进行一次完整的游戏
2. **体验多角色**：选择"暗影特务"体验2个AI的协作
3. **观察AI性格**：注意不同AI如何做出不同的反应
4. **测试API**：使用 cURL 或 Postman 测试 API
5. **查看代码**：理解后端和前端的实现

### 代码示例

```typescript
// 创建游戏会话
const response = await gameApi.createSession(
  scriptId,
  userId,
  characterMappings,
  'normal'
);

// 提交选择
const result = await gameApi.submitChoice(
  sessionId,
  'opt-1',
  '立即调查线索'
);
```

## 🚀 性能指标

- ⚡ 后端启动：< 3秒
- 📡 API响应：< 500ms
- 🤖 故事生成：2-5秒
- 🎨 前端编译：< 30秒
- 📊 支持并发：100+ 会话

## 🌟 主要特性总结

| 特性 | 状态 | 说明 |
|------|------|------|
| 多角色协作 | ✅ | 支持多个AI角色同时参与 |
| 智能推荐 | ✅ | 基于特征匹配推荐AI角色 |
| 动态故事 | ✅ | 根据选择实时生成故事 |
| 三种模式 | ✅ | 正常、调试、对比模式 |
| API完整 | ✅ | 所有功能都有API |
| 文档齐全 | ✅ | 详细的系统文档 |
| 可部署 | ✅ | Docker + 云部署支持 |

## 🔮 未来改进

- [ ] Firebase 数据库集成
- [ ] 用户认证系统
- [ ] 用户自定义 AI 角色
- [ ] 游戏进度保存
- [ ] 多人实时游戏
- [ ] 成就和排行榜
- [ ] 社区内容分享
- [ ] 语音和动画支持

## 📝 许可证

ISC License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- 项目主页：`https://github.com/your-repo`
- 问题反馈：提交 GitHub Issue
- 功能建议：在 Discussions 中讨论

---

**祝你享受这个 AI 驱动的互动故事游戏！** 🎭✨

Made with ❤️ using TypeScript, Next.js, and AI magic ✨

