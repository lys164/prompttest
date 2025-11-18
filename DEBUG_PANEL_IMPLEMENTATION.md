# 游戏调试面板实现说明

## ✅ 完成功能

已成功实现游戏页面的实时调试面板，允许用户在游戏中动态修改系统提示和选择使用的 AI 模型。

## 🎯 核心功能

### 1. 调试面板开关
- **位置**: 游戏页面右下角
- **按钮**: "🔧 打开调试" / "🔧 关闭调试"
- **动画**: 从右侧滑入

### 2. 模型选择
- **默认模型**: `openai/gpt-4-turbo`
- **可选模型**:
  - GPT-4 Turbo
  - GPT-4
  - GPT-3.5 Turbo
  - Claude 3 Opus
  - Claude 3 Sonnet
  - Llama 2 70B

### 3. 系统提示编辑
- **文本框**: 500px 高度，支持多行输入
- **占位符**: "留空表示使用 Firebase 默认系统提示..."
- **状态标记**: 修改后显示 "(已修改)"

### 4. 操作按钮
- **🔄 重置**: 恢复到 Firebase 默认系统提示
- **📋 复制**: 复制当前系统提示到剪贴板

### 5. 状态显示
- 当前使用的模型
- 系统提示状态（自定义 / 默认）
- 游戏状态（进行中 / 未开始）

## 📝 数据流

### 前端流程
```
用户打开调试面板
    ↓
修改系统提示和/或选择模型
    ↓
点击"确认选择"（游戏中的选项）
    ↓
前端构建请求体：
  {
    choiceId: "strategy-xxx",
    userInput: "选项文本",
    systemPromptOverride: "自定义系统提示",  // 如果修改
    selectedModel: "openai/gpt-4-turbo"
  }
    ↓
通过 submitChoice API 提交
```

### 后端流程
```
接收请求体，提取：
  - choiceId
  - userInput
  - systemPromptOverride
  - selectedModel
    ↓
确定最终系统提示：
  finalSystemPrompt = systemPromptOverride || defaultFromFirebase
    ↓
调用 AI 服务：
  - 传入 finalSystemPrompt
  - 传入 selectedModel
  - 其他参数不变
    ↓
AI 生成故事，通过 WebSocket 推送给前端
```

## 🔧 代码修改清单

### 前端修改

#### 1. `frontend/components/game/GamePlayMode.tsx`
- ✅ 添加了 4 个新的 `useState` hooks：
  - `debugMode`: 控制调试面板显示/隐藏
  - `systemPromptOverride`: 存储自定义系统提示
  - `selectedModel`: 存储选择的 AI 模型
  - `isSystemPromptModified`: 标记系统提示是否被修改
- ✅ 添加了 4 个事件处理函数：
  - `handleSystemPromptChange`: 更新自定义系统提示
  - `handleModelChange`: 更新选择的模型
  - `handleResetPrompt`: 重置为默认
  - `handleCopyPrompt`: 复制系统提示
- ✅ 修改 `handleStrategySelection`: 将自定义参数传入 API
- ✅ 添加了 UI 组件：
  - 调试面板开关按钮（右下角）
  - 完整的调试面板 UI（右侧边栏）

#### 2. `frontend/lib/api.ts`
- ✅ 修改 `submitChoice` 方法签名，支持两种调用方式：
  - 旧方式: `submitChoice(sessionId, choiceId, userInput)`
  - 新方式: `submitChoice(sessionId, { choiceId, userInput, systemPromptOverride, selectedModel })`
- ✅ 支持向后兼容

### 后端修改

#### 1. `backend/src/routes/game.ts`
- ✅ 提取新的请求参数：`systemPromptOverride`, `selectedModel`
- ✅ 实现逻辑：
  - 优先使用自定义系统提示，否则使用 Firebase 默认
  - 将选择的模型传给 AI 服务
  - 添加调试日志输出

#### 2. `backend/src/services/aiService.ts`
- ✅ `generateMultiCharacterStory` 方法已支持 `model` 参数
- ✅ 实现了 `callOpenRouter` 时传入指定模型

#### 3. `backend/src/types.ts`
- ✅ 在 `GenerationRequest` 接口中添加 `model?: string` 字段

## 🎮 使用流程

### 开发者使用调试面板

1. **打开调试面板**
   - 点击右下角 "🔧 打开调试" 按钮
   - 调试面板从右侧滑入

2. **修改系统提示**（可选）
   - 在文本框中输入新的系统提示
   - 文本框中会显示 "(已修改)" 状态标记
   - 可以点击 "📋 复制" 复制当前内容
   - 点击 "🔄 重置" 返回 Firebase 默认值

3. **选择模型**（可选）
   - 从下拉菜单中选择想要使用的 AI 模型
   - 当前选择的模型会显示在下方

4. **进行游戏操作**
   - 在游戏中选择任何选项并点击 "✓ 确认选择"
   - 系统会使用修改后的提示和模型来生成故事

5. **查看效果**
   - AI 会使用新的系统提示和模型生成故事
   - 通过 WebSocket 实时推送结果
   - 调整设置继续测试

### 关键特性

✅ **实时生效** - 修改后的系统提示和模型在下一次操作时立即生效
✅ **向后兼容** - 不修改时与原有行为完全相同
✅ **独立控制** - 可以单独修改系统提示或模型，或同时修改
✅ **用户友好** - 清晰的状态指示和操作提示
✅ **性能无影响** - 调试面板为可选显示，不会影响游戏性能

## 📊 调试信息

### 控制台输出
当提交决策时，后端会输出以下调试信息：

```
🚀 开始异步生成故事...
🔧 使用自定义系统提示          // 如果有自定义提示
🤖 使用指定模型: openai/gpt-4  // 如果选择了模型
```

### 前端日志
```
🔧 调试信息: {
    isCustomPrompt: true,        // 是否使用自定义提示
    selectedModel: "openai/gpt-4"
}
```

## 🚀 现在可以测试

1. 打开 http://localhost:3000
2. 选择剧本和 AI 角色
3. 点击进入游戏
4. 点击右下角 "🔧 打开调试" 打开调试面板
5. 修改系统提示或选择模型
6. 在游戏中选择选项，观察效果

## 💡 最佳实践

1. **测试不同模型** - 通过快速切换模型测试效果
2. **优化系统提示** - 编辑系统提示优化生成质量
3. **复制有效提示** - 找到有效的提示后使用复制功能保存
4. **重置回溯** - 任何时候可以点击 "🔄 重置" 回到默认设置

## ✨ 总结

调试面板现已完全集成到游戏中，允许开发者和测试人员在游戏过程中：
- ✅ 实时修改系统提示
- ✅ 快速切换 AI 模型
- ✅ 观察不同配置的效果
- ✅ 优化游戏体验

所有修改都会立即应用到下一次的 AI 请求中，无需重启游戏或服务器。

