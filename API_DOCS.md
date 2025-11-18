# 📚 API 文档

基础 URL: `http://localhost:3001/api`

## 📋 目录

- [剧本 API](#剧本-api)
- [游戏会话 API](#游戏会话-api)
- [开发者工具 API](#开发者工具-api)

---

## 剧本 API

### 获取所有剧本

```http
GET /scripts
```

**查询参数:**
- `category` (可选): `'single-single'` | `'single-multi'` | `'multi-multi'`

**示例请求:**
```bash
curl "http://localhost:3001/api/scripts?category=single-multi"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "script-001",
      "title": "暗影特务",
      "description": "在冷战时期，一位特务特工必须完成一项危险的任务来拯救人质。",
      "category": "single-multi",
      "coverImage": "/images/spy-thriller.jpg",
      "backgroundStory": "2024年，一个国际特务组织...",
      "difficulty": "hard",
      "estimatedPlayTime": 60,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 获取剧本详情

```http
GET /scripts/:scriptId
```

**URL 参数:**
- `scriptId` (必需): 剧本 ID

**示例请求:**
```bash
curl "http://localhost:3001/api/scripts/script-001"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "script": {
      "id": "script-001",
      "title": "暗影特务",
      "description": "...",
      "category": "single-multi",
      "backgroundStory": "...",
      "difficulty": "hard",
      "estimatedPlayTime": 60
    },
    "characters": [
      {
        "id": "char-001",
        "scriptId": "script-001",
        "name": "影子",
        "description": "一位身份成谜的神秘特工",
        "personality": "冷酷、聪慧、危险",
        "goal": "获取机密文件并逃脱",
        "background": "前特务局特工，现为独立特务",
        "systemPrompt": "你是一位经验丰富的特工...",
        "avatar": "/avatars/shadow.jpg"
      }
    ],
    "initialScene": {
      "id": "scene-001",
      "scriptId": "script-001",
      "sceneNumber": 1,
      "description": "秘密集合点",
      "context": "你来到一个废弃的工厂...",
      "choices": [
        {
          "id": "choice-001",
          "text": "直接询问任务的具体细节",
          "consequence": "指挥官会提供详细的情报"
        }
      ]
    }
  }
}
```

---

### 获取剧本的角色列表

```http
GET /scripts/:scriptId/characters
```

**示例请求:**
```bash
curl "http://localhost:3001/api/scripts/script-001/characters"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "char-001",
      "name": "影子",
      "description": "一位身份成谜的神秘特工",
      "personality": "冷酷、聪慧、危险",
      "goal": "获取机密文件并逃脱"
    }
  ]
}
```

---

### 获取初始场景

```http
GET /scripts/:scriptId/initial-scene
```

**示例请求:**
```bash
curl "http://localhost:3001/api/scripts/script-001/initial-scene"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "scene-001",
    "sceneNumber": 1,
    "description": "秘密集合点",
    "context": "你来到一个废弃的工厂。影子和指挥官已经在那里等候。",
    "choices": [...]
  }
}
```

---

## 游戏会话 API

### 创建新游戏会话

```http
POST /game/sessions
```

**请求体:**
```json
{
  "scriptId": "script-001",
  "userId": "user-123",
  "selectedCharacterIds": ["char-001", "char-002"],
  "mode": "normal"
}
```

**参数说明:**
- `scriptId` (必需): 剧本 ID
- `userId` (必需): 用户 ID
- `selectedCharacterIds` (必需): 角色 ID 数组
- `mode` (可选): `'normal'` | `'debug'` | `'compare'`，默认为 `'normal'`

**示例请求:**
```bash
curl -X POST "http://localhost:3001/api/game/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": "script-001",
    "userId": "user-123",
    "selectedCharacterIds": ["char-001"],
    "mode": "normal"
  }'
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-abc123",
    "initialScene": {
      "id": "scene-001",
      "description": "秘密集合点",
      "context": "你来到一个废弃的工厂...",
      "choices": [...]
    },
    "script": {
      "id": "script-001",
      "title": "暗影特务"
    }
  }
}
```

---

### 获取游戏会话信息

```http
GET /game/sessions/:sessionId
```

**示例请求:**
```bash
curl "http://localhost:3001/api/game/sessions/session-abc123"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "session-abc123",
    "scriptId": "script-001",
    "userId": "user-123",
    "selectedCharacters": ["char-001"],
    "mode": "normal",
    "currentSceneId": "scene-001",
    "status": "ongoing",
    "dialogueHistory": [],
    "startedAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:05:00Z"
  }
}
```

---

### 提交选择并获取下一个场景

```http
POST /game/sessions/:sessionId/choose
```

**请求体:**
```json
{
  "choiceId": "choice-001",
  "userInput": "我选择直接询问"
}
```

**参数说明:**
- `choiceId` (必需): 选择 ID
- `userInput` (可选): 用户的自定义输入

**示例请求:**
```bash
curl -X POST "http://localhost:3001/api/game/sessions/session-abc123/choose" \
  -H "Content-Type: application/json" \
  -d '{
    "choiceId": "choice-001",
    "userInput": "我决定先检查周围环境"
  }'
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "narrative": "你仔细检查了工厂的每个角落...",
    "choices": [
      {
        "id": "choice-002",
        "text": "向前进发",
        "consequence": "发现了隐藏的通道"
      },
      {
        "id": "choice-003",
        "text": "返回原地",
        "consequence": "等待团队成员"
      }
    ],
    "dialogueHistory": [
      {
        "id": "dialogue-001",
        "characterId": "user-123",
        "characterName": "玩家",
        "content": "我决定先检查周围环境",
        "type": "user-input",
        "timestamp": "2024-01-01T12:05:00Z"
      },
      {
        "id": "dialogue-002",
        "characterId": "char-001",
        "characterName": "影子",
        "content": "你仔细检查了工厂的每个角落...",
        "type": "ai-response",
        "modelUsed": "gpt-4-turbo-preview",
        "timestamp": "2024-01-01T12:05:02Z"
      }
    ],
    "modelUsed": "gpt-4-turbo-preview",
    "generationTime": 1523
  }
}
```

---

### 获取会话的对话历史

```http
GET /game/sessions/:sessionId/history
```

**示例请求:**
```bash
curl "http://localhost:3001/api/game/sessions/session-abc123/history"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dialogue-001",
      "characterId": "user-123",
      "characterName": "玩家",
      "content": "我选择直接询问",
      "type": "user-input",
      "timestamp": "2024-01-01T12:05:00Z"
    },
    {
      "id": "dialogue-002",
      "characterId": "char-001",
      "characterName": "影子",
      "content": "指挥官走上前来，递给你一个加密的U盘...",
      "type": "ai-response",
      "modelUsed": "gpt-4-turbo-preview",
      "timestamp": "2024-01-01T12:05:02Z"
    }
  ]
}
```

---

## 开发者工具 API

### 调试 Prompt

```http
POST /dev/debug
```

**请求体:**
```json
{
  "prompt": "你是一个故事生成器...",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7
}
```

**参数说明:**
- `prompt` (必需): 要测试的提示词
- `model` (可选): 模型选择，默认为 `'gpt-4-turbo-preview'`
- `temperature` (可选): 温度参数，范围 0-1，默认为 0.7

**示例请求:**
```bash
curl -X POST "http://localhost:3001/api/dev/debug" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "给我讲一个关于冒险的故事",
    "model": "gpt-4-turbo-preview",
    "temperature": 0.8
  }'
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "debug-1704110702000",
    "prompt": "给我讲一个关于冒险的故事",
    "response": "从前有一个勇敢的探险家...",
    "model": "gpt-4-turbo-preview",
    "timestamp": "2024-01-01T12:05:02Z",
    "tokens": {
      "input": 8,
      "output": 156
    }
  }
}
```

---

### 对比多个模型

```http
POST /dev/compare
```

**请求体:**
```json
{
  "prompt": "生成一个有趣的故事开头",
  "models": ["gpt-4-turbo-preview", "gpt-3.5-turbo"]
}
```

**参数说明:**
- `prompt` (必需): 测试提示词
- `models` (可选): 模型数组，默认为 `['gpt-4-turbo-preview', 'gpt-3.5-turbo']`

**示例请求:**
```bash
curl -X POST "http://localhost:3001/api/dev/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "生成一个有趣的故事开头",
    "models": ["gpt-4-turbo-preview", "gpt-3.5-turbo"]
  }'
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "prompt": "生成一个有趣的故事开头",
    "results": [
      {
        "model": "gpt-4-turbo-preview",
        "response": "从前有一个神秘的魔法师...",
        "tokens": 156,
        "time": 1523
      },
      {
        "model": "gpt-3.5-turbo",
        "response": "在一个遥远的王国里...",
        "tokens": 89,
        "time": 892
      }
    ],
    "totalTime": 2415,
    "timestamp": "2024-01-01T12:05:02Z"
  }
}
```

---

### 获取可用的模型列表

```http
GET /dev/models
```

**示例请求:**
```bash
curl "http://localhost:3001/api/dev/models"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "gpt-4-turbo-preview",
      "name": "GPT-4 Turbo",
      "provider": "OpenAI",
      "description": "强大的通用模型"
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "provider": "OpenAI",
      "description": "快速且成本效益高"
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "Anthropic",
      "description": "推理能力强"
    }
  ]
}
```

---

### 创建调试会话

```http
POST /dev/debug-session
```

**示例请求:**
```bash
curl -X POST "http://localhost:3001/api/dev/debug-session"
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "debug-session-abc123"
  }
}
```

---

### 向调试会话添加测试

```http
POST /dev/debug-session/:sessionId/test
```

**请求体:**
```json
{
  "prompt": "测试提示词",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "mode": "single"
}
```

**参数说明:**
- `prompt` (必需): 测试提示词
- `model` (可选): 模型，默认为 `'gpt-4-turbo-preview'`
- `temperature` (可选): 温度，默认为 0.7
- `mode` (可选): `'single'` | `'compare'`，默认为 `'single'`

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "debug-session-abc123",
    "debugResponses": [...],
    "compareResults": [...]
  }
}
```

---

### 获取调试会话结果

```http
GET /dev/debug-session/:sessionId
```

**示例请求:**
```bash
curl "http://localhost:3001/api/dev/debug-session/debug-session-abc123"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "debug-session-abc123",
    "debugResponses": [
      {
        "id": "debug-1704110702000",
        "prompt": "测试提示词",
        "response": "AI的响应...",
        "model": "gpt-4-turbo-preview",
        "timestamp": "2024-01-01T12:05:02Z",
        "tokens": { "input": 10, "output": 150 }
      }
    ],
    "compareResults": []
  }
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

| 状态码 | 错误 | 描述 |
|-------|------|------|
| 400 | Bad Request | 请求参数缺失或无效 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

### 错误示例

```bash
# 脚本不存在
curl "http://localhost:3001/api/scripts/invalid-id"
```

```json
{
  "success": false,
  "error": "Script not found"
}
```

---

## 速率限制

当前版本无速率限制，但建议在生产环境中实施：
- 每个 IP：100 请求/分钟
- 开发者端点：10 请求/分钟

---

## 认证

当前版本不需要认证。未来版本将支持：
- Bearer Token 认证
- OAuth 2.0

---

## 版本控制

当前 API 版本：`v1`

URL: `/api/v1/...`（未来计划）

---

**最后更新**: 2024-01-01  
**文档版本**: 1.0.0

