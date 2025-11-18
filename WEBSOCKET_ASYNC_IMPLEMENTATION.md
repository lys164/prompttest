# WebSocket 实时推送 + 异步 AI 请求实现总结

## 📋 概述

已实现 WebSocket 实时推送机制，配合后端异步 AI 请求处理，使得游戏能够提供更好的用户体验：

1. **用户提交决策** → 立即进入下一个界面
2. **后端异步处理** → 后台调用 AI 模型
3. **实时推送** → 故事生成完成后通过 WebSocket 推送给前端

## 🔧 技术实现

### 后端修改

#### 1. **WebSocket 服务器初始化** (`backend/src/index.ts`)

```typescript
import http from 'http';
import WebSocket from 'ws';

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 WebSocket 服务器
export const wss = new WebSocket.Server({ server });

// 存储连接的客户端
const clients = new Map<string, WebSocket>();

// 广播函数
export function broadcastToSession(sessionId: string, data: any) {
    const client = clients.get(sessionId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
}
```

#### 2. **游戏路由异步处理** (`backend/src/routes/game.ts`)

**之前**：等待 AI 返回 → 返回响应

**现在**：立即返回 → 异步处理 → WebSocket 推送

```typescript
// 立即返回 "生成中" 状态给前端
res.json({
    success: true,
    status: 'generating',
    message: '正在生成故事，请稍候...',
});

// 异步处理 AI 请求（后台运行，不阻塞响应）
(async () => {
    try {
        // 调用 AI 模型
        const generateResponse = await aiService.generateMultiCharacterStory(...);
        
        // ... 处理数据 ...
        
        // 通过 WebSocket 发送给前端
        broadcastToSession(sessionId, {
            type: 'story_generated',
            success: true,
            data: {
                narrative: narrativeWithReplacedVariables,
                choicePoint: generateResponse.nextChoicePoint,
                options: replacedOptions,
                // ... 其他数据 ...
            },
        });
    } catch (error) {
        // 错误处理
        broadcastToSession(sessionId, {
            type: 'story_error',
            success: false,
            error: error.message,
        });
    }
})();
```

### 前端修改

#### 1. **WebSocket 客户端** (`frontend/lib/websocket.ts`)

创建了一个独立的 WebSocket 管理类，提供：
- 自动重连机制（最多 5 次尝试）
- 消息处理器注册
- 连接状态管理

```typescript
class WebSocketClient {
    connect(sessionId: string): Promise<void>
    on(messageType: string, handler: (data: any) => void)
    off(messageType: string)
    disconnect()
    isConnected(): boolean
}

export const wsClient = new WebSocketClient();
```

#### 2. **游戏组件更新** (`frontend/components/game/GamePlayMode.tsx`)

**useEffect 中的 WebSocket 连接**：
```typescript
useEffect(() => {
    initializeGame();
    
    // 连接 WebSocket
    wsClient.connect(sessionId);

    // 注册消息处理器
    wsClient.on('story_generated', handleStoryGenerated);
    wsClient.on('story_error', handleStoryError);

    // 清理
    return () => {
        wsClient.disconnect();
    };
}, [sessionId]);
```

**立即显示"生成中"界面**：
```typescript
const handleStrategySelection = async (strategy: any) => {
    setLoading(true);
    setGameStarted(true);  // 立即进入"生成中"界面
    
    // 提交选择
    const response = await gameApi.submitChoice(...);
    
    if (response.data.status === 'generating') {
        // 等待 WebSocket 消息
    }
};
```

**处理 WebSocket 消息**：
```typescript
const handleStoryGenerated = (message: any) => {
    setNarrative(message.data.narrative);
    setChoices(message.data.options);
    setLoading(false);
};

const handleStoryError = (message: any) => {
    setError(message.error);
    setLoading(false);
};
```

## 📊 工作流程

```
用户点击"确认选择"
    ↓
前端立即显示"生成中..."界面
    ↓
前端通过 HTTP POST 提交选择
    ↓
后端立即返回 { status: 'generating' }
    ↓
前端继续等待 WebSocket 消息
    ↓
后端异步调用 AI 模型
    ↓
AI 返回故事内容
    ↓
后端通过 WebSocket 推送 'story_generated' 消息
    ↓
前端收到消息，更新显示故事和新选项
```

## 🔗 WebSocket 消息格式

### 故事生成完成
```json
{
    "type": "story_generated",
    "success": true,
    "data": {
        "narrative": "故事文本...",
        "choicePoint": "下一个选择点",
        "options": [
            { "id": "1", "文本": "选项1", "后果描述": "后果1" },
            { "id": "2", "文本": "选项2", "后果描述": "后果2" }
        ],
        "dialogueHistory": [...],
        "modelUsed": "gpt-4",
        "generationTime": 2345
    }
}
```

### 故事生成错误
```json
{
    "type": "story_error",
    "success": false,
    "error": "错误信息"
}
```

## 🎯 优势

1. **更快的响应** - 用户立即看到界面，不需要等待 AI 模型
2. **更好的 UX** - 清晰的"生成中..."反馈
3. **可扩展性** - WebSocket 可以轻松扩展以支持其他消息类型
4. **错误恢复** - WebSocket 连接失败时会自动重试

## 📦 依赖项

**后端新增**：
- `ws@8.15.0` - WebSocket 服务器
- `@types/ws@8.5.10` - TypeScript 类型定义

## ✅ 状态

- ✅ 后端 WebSocket 服务器实现
- ✅ 后端异步 AI 请求处理
- ✅ 前端 WebSocket 客户端实现
- ✅ 前端消息处理逻辑
- ✅ 自动重连机制
- ✅ 编译成功
- ✅ 后端已重启

## 🚀 下一步

前端应该已经更新，现在可以测试完整的工作流：

1. 打开游戏
2. 选择剧本和 AI 角色
3. 选择一个初始决策选项
4. 观察界面立即切换到"生成中..."
5. 等待 WebSocket 推送故事内容
6. 查看生成的故事和新选项

