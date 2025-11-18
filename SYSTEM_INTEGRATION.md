# 🎭 系统集成完整指南

## 概述

本项目已成功集成完整的多角色故事生成系统，支持用户选择自己的AI角色扮演剧本中的不同角色。

## 核心组件

### 1️⃣ 类型定义 (`backend/src/types.ts`)

#### 用户AI角色
```typescript
interface UserAICharacter {
  // 基本信息
  姓名: string;
  和用户的身份: string;
  
  // 能力
  超能力: Array<{ 名称, 等级, 描述 }>;
  是否有原型: boolean;
  
  // 个人信息
  年龄: number;
  生日: string;
  国籍: string;
  语言: string[];
  
  // 性格特征
  外貌描述: string;
  喜好特长: string[];
  讨厌的东西: string[];
  星座: string;
  MBTI: string;
  
  // 心理特征
  面对未知的态度: string;
  恐惧软肋: string;
}
```

#### 剧本角色
```typescript
interface ScriptCharacter {
  roleId: string;
  姓名: string;
  角色简介: string;
  角色目标: string;
  角色视角的故事背景: string;
  第一个选择点: string;
  预置策略选项: Array<{
    id: string;
    文本: string;
    后果描述: string;
    推荐AI特征: string[];
  }>;
}
```

#### 角色映射
```typescript
interface CharacterMapping {
  userAICharacterId: string;     // 用户的AI角色ID
  scriptRoleId: string;          // 剧本中的角色ID
  scriptCharacterName: string;   // 剧本角色名称
  userAICharacterName: string;   // 用户AI角色名称
}
```

### 2️⃣ 后端服务

#### ScriptService
- 从模拟数据库获取剧本信息
- 支持按类别筛选：`【单人】【单AI】`、`【单人】【多AI】`、`【多人】【多AI】`
- 返回完整的角色池和详细设定

```typescript
// 示例调用
const script = await scriptService.getScriptById('script-001');
const roleCharacters = await scriptService.getScriptCharacters('script-001');
```

#### UserService
- 获取用户的所有AI角色
- 推荐合适的AI角色（基于特征匹配）
- 创建示例AI角色用于演示

```typescript
// 示例调用
const characters = await userService.getUserAICharacters(userId);
const recommended = await userService.recommendCharacters(userId, traits);
```

#### AIService
- 生成多角色故事
- 处理每个参与角色的独特反应
- 支持多个AI模型对比

```typescript
// 示例调用
const response = await aiService.generateMultiCharacterStory({
  sessionId,
  currentContext,
  userChoice,
  participatingCharacters,
  systemPrompt,
});
```

### 3️⃣ 后端API路由

#### 游戏会话API (`/api/game`)

```bash
# 获取用户的AI角色
GET /api/game/user-characters/:userId

# 获取推荐的AI角色
GET /api/game/recommend-characters/:userId?traits=trait1,trait2

# 创建游戏会话
POST /api/game/sessions
Body: {
  scriptId: string,
  userId: string,
  characterMappings: CharacterMapping[],
  mode: 'normal' | 'debug' | 'compare'
}

# 获取会话详情
GET /api/game/sessions/:sessionId

# 提交选择并生成故事
POST /api/game/sessions/:sessionId/choose
Body: {
  choiceId: string,
  userInput?: string
}

# 获取对话历史
GET /api/game/sessions/:sessionId/history
```

#### 剧本API (`/api/scripts`)

```bash
# 获取所有剧本
GET /api/scripts?category=【单人】【多AI】

# 获取剧本详情
GET /api/scripts/:scriptId

# 获取剧本的角色列表
GET /api/scripts/:scriptId/characters
```

### 4️⃣ 前端组件

#### CharacterSelector 组件
- 显示剧本所需的角色
- 显示用户的可用AI角色
- 显示推荐的AI角色（基于特征匹配）
- 验证选择数量

```typescript
<CharacterSelector
  scriptId={scriptId}
  userId={userId}
  script={script}
  onConfirm={handleCharacterMappingsConfirm}
  onCancel={() => setShowCharacterSelector(false)}
/>
```

#### 脚本详情页
- 显示完整的剧本信息
- 显示角色池
- 支持三种游戏模式：正常、调试、对比
- 触发角色选择器

## 数据流

### 游戏开始流程

```
1. 用户在剧本大厅选择剧本
   ↓
2. 进入剧本详情页
   - 显示剧本信息和角色池
   - 显示需要多少个AI角色
   ↓
3. 用户点击"开始游戏"按钮
   ↓
4. 打开角色选择器
   - 加载用户的所有AI角色
   - 根据推荐特征展示最佳选择
   ↓
5. 用户为每个剧本角色选择一个AI角色
   ↓
6. 后端创建游戏会话
   - 保存所有角色映射
   - 验证角色数量
   - 初始化会话状态
   ↓
7. 跳转到游戏页面
   - 显示初始场景
   - 显示选择点和策略选项
```

### 故事生成流程

```
1. 用户选择一个选项或输入自由选择
   ↓
2. 后端接收用户选择
   ↓
3. 获取游戏会话和所有参与角色
   ↓
4. 为每个参与角色构建详细信息
   ↓
5. 调用AIService生成故事
   - 构建多角色系统提示
   - 包含所有角色的特征信息
   - 请求AI为每个角色生成反应
   ↓
6. 解析AI响应
   - 提取故事叙述
   - 提取每个角色的反应
   - 提取下一个选择点
   ↓
7. 返回给前端
   - 显示故事叙述
   - 显示角色反应
   - 显示新的选择点
```

## 示例数据

### 示例剧本1：暗影特务

- **类别**：`【单人】【多AI】`
- **需要角色数**：2
- **参与AI数**：2
- **角色池**：
  - 影子（特工）
  - 指挥官（指挥中心）

### 示例剧本2：魔法学院

- **类别**：`【单人】【单AI】`
- **需要角色数**：1
- **参与AI数**：1
- **角色池**：
  - 梅林导师

### 示例AI角色（可用于选择）

1. **勇敢的探险家**
   - MBTI: ENFP
   - 特长：冒险、解谜、沟通
   - 等级：7

2. **智慧的魔法师**
   - MBTI: INTJ
   - 特长：魔法、教学、研究
   - 等级：9

3. **忠诚的骑士**
   - MBTI: ISTJ
   - 特长：战斗、保护、正义
   - 等级：8

## API 响应示例

### 创建游戏会话

**请求**：
```json
{
  "scriptId": "script-001",
  "userId": "user-123",
  "characterMappings": [
    {
      "userAICharacterId": "ai-char-001",
      "scriptRoleId": "shadow-agent",
      "scriptCharacterName": "影子",
      "userAICharacterName": "勇敢的探险家"
    },
    {
      "userAICharacterId": "ai-char-002",
      "scriptRoleId": "commander",
      "scriptCharacterName": "指挥官",
      "userAICharacterName": "智慧的魔法师"
    }
  ],
  "mode": "normal"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "sessionId": "session-xyz",
    "script": { /* 完整剧本信息 */ },
    "characterMappings": [ /* 角色映射 */ ],
    "initialChoicePoint": "你在旅馆房间里发现了一个隐藏的线索。你应该："
  }
}
```

### 提交选择

**请求**：
```json
{
  "choiceId": "opt-1",
  "userInput": "立即调查线索"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "narrative": "你小心翼翼地接近隐藏的线索...",
    "choicePoint": "你发现了一份加密文件...",
    "options": [
      {
        "id": "opt-a",
        "文本": "尝试破译文件",
        "后果描述": "冒险但可能获得关键信息"
      }
    ],
    "characterResponses": [
      {
        "characterName": "勇敢的探险家",
        "response": "你的冒险精神得到了回报！"
      },
      {
        "characterName": "智慧的魔法师",
        "response": "这看起来像是个陷阱..."
      }
    ],
    "modelUsed": "openai/gpt-5.1-chat",
    "generationTime": 2500
  }
}
```

## 推荐系统

推荐系统根据剧本角色的推荐特征和用户AI角色的特征进行匹配：

```typescript
// 推荐特征匹配
const isRecommended = trait =>
  userAICharacter.喜好特长.includes(trait) ||
  userAICharacter.MBTI.includes(trait) ||
  userAICharacter.面对未知的态度.includes(trait);
```

## 游戏模式

### 1. 正常游玩 (Normal)
- 完整的游戏体验
- 所有角色参与
- 实时生成故事

### 2. 调试模式 (Debug)
- 测试单个模型的Prompt效果
- 查看原始AI响应
- 调整系统提示

### 3. 对比模式 (Compare)
- 同时测试多个AI模型
- 比较生成质量
- 选择最佳模型

## 完整的游戏流程示例

```
1. 用户打开应用 → 看到剧本大厅
2. 选择"暗影特务"剧本
3. 查看剧本详情：
   - 需要2个AI角色
   - 角色池：影子、指挥官
4. 点击"正常游玩"
5. 打开角色选择器：
   - 为"影子"选择"勇敢的探险家"（推荐）
   - 为"指挥官"选择"智慧的魔法师"（推荐）
6. 创建游戏会话 → 跳转到游戏页面
7. 看到初始场景和三个选择点
8. 选择一个选项 → AI生成故事
9. 看到故事叙述和两个角色的反应
10. 重复步骤7-9直到游戏结束
```

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- OpenRouter API
- 模拟数据存储

### 前端
- Next.js + React
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

## 环境变量配置

**后端** (`.env`):
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxx
```

**前端** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 下一步

1. **Firebase集成**：将模拟数据迁移到Firebase Firestore
2. **用户认证**：添加用户登录和注册
3. **AI角色管理**：实现用户创建自己的AI角色
4. **持久化**：保存游戏进度和成就
5. **实时多人**：支持多用户实时对话

