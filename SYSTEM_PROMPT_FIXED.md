# 调试面板系统提示加载 - 功能实现完成

## ✅ 已完成的实现

调试面板中的"系统提示"功能已经完全实现，现在会自动从 Firebase 加载默认系统提示！

## 📋 实现细节

### 1. 后端 API 端点 (GET /api/game/sessions/:sessionId/system-prompt)

✅ **已实现**：
- 接受 `sessionId` 路径参数
- 接受 `scriptId` 查询参数（用于在会话未创建时直接查询）
- 根据剧本类别确定提示类型（single-single-sp, single-multi-sp, multi-multi-sp）
- 从 Firebase Prompts.livestory 集合获取系统提示
- 返回系统提示和提示类型

### 2. 前端 API 调用 (frontend/lib/api.ts)

✅ **已实现**：
```typescript
gameApi.getSystemPrompt(sessionId: string, scriptId?: string)
```
- 支持可选的 `scriptId` 参数
- 如果提供 `scriptId`，作为查询参数传递
- 返回系统提示和提示类型

### 3. 前端加载逻辑 (frontend/components/game/GamePlayMode.tsx)

✅ **已实现**：
- 新增 `loadSystemPrompt()` 函数
  - 从 `script.剧本类别` 确定提示类型
  - 调用 `gameApi.getSystemPrompt()` 获取系统提示
  - 将系统提示保存到 `defaultSystemPrompt` 和 `systemPromptOverride` 状态
  
- 新增专门的 `useEffect` 监听 `script?.id` 变化
  - 当 script 加载完成时自动调用 `loadSystemPrompt()`
  - 不依赖 `initializeGame()` 的时机

- 新增 `defaultSystemPrompt` 状态
  - 存储从 Firebase 加载的原始系统提示
  - 用于重置功能

- 修改 `handleResetPrompt()` 函数
  - 现在可以恢复到 Firebase 默认值而不是清空
  
- 修改重置按钮的禁用条件
  - 只在修改状态下启用
  - 且必须有从 Firebase 加载的默认值

## 🧪 验证方式

### 手动测试 API（已验证成功）

```bash
curl -s "http://localhost:3001/api/game/sessions/test-session/system-prompt?scriptId=%E5%8D%B1%E9%99%A9%E8%AF%95%E6%8E%A2-%E5%8D%95%E4%BA%BA%E5%8D%95AI"
```

**结果**：✅ 返回完整的系统提示文本（2230+ 字符）

### 前端测试（已实现）

1. 进入游戏页面
2. 打开调试面板（🔧 打开调试）
3. 查看"📝 系统提示"文本框
4. **预期**：应显示 Firebase 中的默认系统提示（而非空或占位符）

## 📱 UI 流程

### 正常流程
1. 用户进入游戏 (`GamePlayMode.tsx` 被加载)
2. `script` 从父组件传入
3. `useEffect` 监听 `script?.id` 变化，触发 `loadSystemPrompt()`
4. `loadSystemPrompt()` 调用后端 API 获取系统提示
5. 系统提示被保存到两个 state
   - `defaultSystemPrompt`: 原始值（用于重置）
   - `systemPromptOverride`: 当前值（用于显示和修改）
6. 调试面板的文本框显示系统提示内容
7. 用户可以：
   - 修改系统提示（标记为已修改）
   - 点击"🔄 重置"恢复原始值
   - 点击"📋 复制"复制到剪贴板

### 修改流程
1. 用户在文本框中编辑系统提示
2. `handleSystemPromptChange()` 更新 `systemPromptOverride` 并设置 `isSystemPromptModified = true`
3. 按钮变化：
   - "🔄 重置"变为启用状态
   - 标签显示 "(已修改)"
   - 状态显示"自定义"
4. 当提交选择时，修改后的系统提示被发送到后端

## 🔧 技术细节

### 类别转换逻辑

```typescript
let promptType = 'single-single-sp'; // 默认值
if (script.剧本类别.includes('【多人】') && script.剧本类别.includes('【多AI】')) {
    promptType = 'multi-multi-sp';
} else if (script.剧本类别.includes('【单人】') && script.剧本类别.includes('【多AI】')) {
    promptType = 'single-multi-sp';
}
```

### State 管理

```typescript
const [systemPromptOverride, setSystemPromptOverride] = useState<string>('');
const [defaultSystemPrompt, setDefaultSystemPrompt] = useState<string>('');
const [isSystemPromptModified, setIsSystemPromptModified] = useState(false);
```

### API 响应结构

```json
{
  "success": true,
  "data": {
    "systemPrompt": "## 系统定位\n你是一个沉浸式互动影视游戏的叙事引擎...",
    "promptType": "single-single-sp"
  }
}
```

## 📁 修改的文件

### 后端
- `backend/src/routes/game.ts`
  - 新增 `GET /api/game/sessions/:sessionId/system-prompt` 路由
  - 支持 `scriptId` 查询参数

### 前端
- `frontend/lib/api.ts`
  - 修改 `gameApi.getSystemPrompt()`，支持 `scriptId` 参数
  
- `frontend/components/game/GamePlayMode.tsx`
  - 新增 `loadSystemPrompt()` 函数
  - 新增监听 `script?.id` 的 `useEffect`
  - 新增 `defaultSystemPrompt` state
  - 修改 `handleResetPrompt()`
  - 修改重置按钮禁用条件

## ✨ 关键特性

✅ **自动加载** - script 加载后自动从 Firebase 加载系统提示
✅ **持久化默认值** - 允许用户修改后仍能恢复默认值
✅ **错误处理** - 加载失败不影响游戏进行
✅ **用户反馈** - 清晰的修改状态指示
✅ **灵活查询** - 支持通过 sessionId 或 scriptId 查询

## 🚀 后续测试建议

1. **创建新的游戏会话** - 确保 `script` 被正确传入并加载系统提示
2. **验证系统提示内容** - 检查是否显示完整的 Firebase 提示
3. **测试修改流程** - 编辑系统提示并验证按钮状态变化
4. **测试重置功能** - 修改后点击重置，确保恢复到原始值
5. **测试复制功能** - 复制系统提示到剪贴板并验证
6. **测试不同脚本类型** - 单人单AI、单人多AI、多人多AI

## 💡 故障排查

### 如果系统提示仍为空
1. 检查浏览器控制台是否有错误
2. 检查网络请求是否成功（状态码 200）
3. 检查 `script?.id` 是否正确
4. 查看后端日志检查 Firebase 查询

### 如果按钮禁用
- 这表示 `defaultSystemPrompt` 为空或未修改
- 检查是否成功加载了系统提示

## 📝 总结

系统提示加载功能已完全实现，调试面板现在会在游戏加载时自动从 Firebase 显示默认系统提示。用户可以实时修改、重置或复制系统提示，修改会在下一次 AI 请求中生效。

所有实现都遵循错误处理最佳实践，即使 Firebase 加载失败也不会影响游戏进行。

