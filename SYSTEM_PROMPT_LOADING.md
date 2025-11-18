# 调试面板 - 系统提示加载功能

## ✅ 现在调试面板中的"系统提示"已经能显示 Firebase 的默认提示

之前的问题已经解决！现在调试面板会在游戏初始化时自动从 Firebase 加载默认系统提示。

## 🎯 工作流程

### 1. 游戏初始化 (GamePlayMode.tsx)
- 当进入游戏时，`initializeGame` 函数会被调用
- 自动调用新的 API 端点 `GET /api/game/sessions/:sessionId/system-prompt`
- 获取 Firebase 中对应剧本类别的系统提示

### 2. 后端 API 端点 (backend/src/routes/game.ts)
```
GET /api/game/sessions/:sessionId/system-prompt
```
- 获取 session 对应的剧本
- 根据剧本的 `剧本类别` 确定提示类型（例如：single-single、single-multi 等）
- 从 Firebase `Prompts.livestory` 集合读取对应的系统提示
- 返回系统提示和提示类型

### 3. 前端 API 客户端 (frontend/lib/api.ts)
```typescript
gameApi.getSystemPrompt(sessionId)
```
- 调用后端 API 获取系统提示
- 返回 `{ systemPrompt, promptType }`

### 4. 调试面板显示
- 系统提示自动填充在文本框中
- 用户可以实时修改
- 修改后的提示会在下一次 AI 请求中使用

## 📊 状态管理

### 前端 State
```typescript
const [systemPromptOverride, setSystemPromptOverride] = useState<string>('');
const [defaultSystemPrompt, setDefaultSystemPrompt] = useState<string>(''); // Firebase 默认提示
const [isSystemPromptModified, setIsSystemPromptModified] = useState(false); // 是否被修改
```

### 修改流程
1. **初始化**: 从 Firebase 加载默认提示到 `defaultSystemPrompt` 和 `systemPromptOverride`
2. **修改**: 用户编辑文本框 → `systemPromptOverride` 更新 → `isSystemPromptModified = true`
3. **重置**: 点击"🔄 重置" → `systemPromptOverride` 恢复到 `defaultSystemPrompt`
4. **复制**: 点击"📋 复制" → 当前 `systemPromptOverride` 复制到剪贴板

## 🔧 API 实现细节

### 后端逻辑
```typescript
// 获取系统提示的完整流程：
1. 从 sessions Map 获取 sessionId 对应的会话
2. 从数据库获取该会话的剧本信息
3. 根据 script.剧本类别 确定提示类型
4. 调用 scriptService.getSystemPromptTemplate(promptType)
5. 返回系统提示给前端
```

### 类别转换规则
```
【单人】【单AI】 → single-single
【单人】【多AI】 → single-multi
【多人】【多AI】 → multi-multi
```

## 💡 使用场景

### 场景 1: 快速预览默认提示
1. 进入游戏
2. 打开调试面板 (🔧 打开调试)
3. 查看系统提示文本框中的内容
4. **现在不再是空的，而是显示 Firebase 中的真实提示！**

### 场景 2: 修改提示进行测试
1. 在系统提示文本框中进行编辑
2. 按钮变化：
   - 📝 标签显示 "(已修改)"
   - 🔄 重置按钮变为启用状态
   - 状态显示改为 "自定义"
3. 进行任何游戏操作（选择选项）
4. 新的 AI 请求会使用修改后的系统提示

### 场景 3: 恢复默认提示
1. 修改了提示后，点击 "🔄 重置" 按钮
2. 系统提示恢复到从 Firebase 加载的原始值
3. 修改标记被清除

### 场景 4: 保存提示
1. 点击 "📋 复制" 按钮
2. 当前系统提示被复制到剪贴板
3. 可以粘贴到编辑器或其他地方保存

## 📝 调试面板显示

### 系统提示区域
```
📝 系统提示 (已修改) [仅在修改时显示]
┌─────────────────────────────────────────┐
│ 你是一个扮演多个角色的故事讲述者...      │
│ [系统提示内容]                           │
│                                           │
└─────────────────────────────────────────┘
✓ 使用自定义系统提示 [修改时显示]
✓ 使用 Firebase 默认系统提示 [未修改时显示]
```

### 操作按钮
- 🔄 重置 - 恢复到 Firebase 默认值（在修改时启用）
- 📋 复制 - 复制系统提示到剪贴板（有内容时启用）

### 状态信息
```
📊 当前状态
─────────────────────────────
模型: gpt-4-turbo
系统提示: 默认 / 自定义
```

## 🚀 新增功能

### 1. 自动加载系统提示
- ✅ 游戏初始化时自动从 Firebase 加载
- ✅ 支持错误处理（加载失败不影响游戏）
- ✅ 带有 console.log 日志便于调试

### 2. 改进的修改追踪
- ✅ `defaultSystemPrompt` 存储原始值
- ✅ `isSystemPromptModified` 追踪修改状态
- ✅ 准确的重置功能

### 3. 更好的用户反馈
- ✅ 修改标记显示
- ✅ 按钮状态动态更新
- ✅ 状态信息实时显示

## 🔍 故障排查

### 系统提示仍然为空？
1. 检查 Firebase `Prompts.livestory` 集合是否存在
2. 确认对应的系统提示字段存在（如 `single-single-sp`）
3. 检查浏览器控制台是否有加载失败的错误
4. 重新加载游戏页面

### 重置按钮显示为禁用？
- 这表示系统提示还未从 Firebase 加载
- 检查后端 API 端点是否正常工作
- 查看浏览器网络标签中的 API 请求

## 📋 相关文件更改

### 前端文件
- `frontend/components/game/GamePlayMode.tsx`
  - 添加 `defaultSystemPrompt` state
  - 在 `initializeGame` 中加载系统提示
  - 更新 `handleResetPrompt` 恢复到默认值

- `frontend/lib/api.ts`
  - 添加 `gameApi.getSystemPrompt()` 方法

### 后端文件
- `backend/src/routes/game.ts`
  - 添加 `GET /api/game/sessions/:sessionId/system-prompt` 端点
  - 实现系统提示的获取和返回逻辑

## ✨ 总结

现在调试面板的"系统提示"不再是空的！它会：

✅ 在游戏加载时自动从 Firebase 加载默认系统提示
✅ 在文本框中清晰地显示提示内容
✅ 允许用户在线修改提示进行测试
✅ 在修改时提供可视化反馈（标记、按钮状态）
✅ 支持重置到默认值和复制到剪贴板

**现在就试试吧！进入游戏，打开调试面板，你会看到 Firebase 中的真实系统提示！** 🎉

