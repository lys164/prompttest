# 用户提示（User Prompt）实现指南

## 📋 概述

系统现在支持从 Firebase 动态加载用户提示（User Prompt），用于与 AI 模型的对话。

## 🔧 数据结构

### Firebase Prompts.livestory 文档

需要在 `Prompts.livestory` 文档中添加以下三个字段：

```
Prompts/
└── livestory (文档)
    ├── character (字段) - 角色设定模板
    ├── single-single-sp (字段) - 单人×单AI 系统提示
    ├── single-single-up (字段) - 单人×单AI 用户提示 ← NEW
    ├── single-multi-sp (字段) - 单人×多AI 系统提示
    ├── single-multi-up (字段) - 单人×多AI 用户提示 ← NEW
    ├── multi-multi-sp (字段) - 多人×多AI 系统提示
    └── multi-multi-up (字段) - 多人×多AI 用户提示 ← NEW
```

## 📝 用户提示模板格式

### 单人×单AI (`single-single-up`)

```
## 上下文信息

- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}

- **用户的选择**: {{用户选择的选项的具体内容}}

- **已发生的关键剧情**: {{历史重要情节}}

## 任务

根据以上上下文，继续生成故事的发展。确保：
1. 剧情连贯
2. 尊重用户的选择
3. 体现角色的性格
4. 生成 3-5 个新的决策选项
```

### 单人×多AI (`single-multi-up`)

```
## 上下文信息

- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}

- **用户的选择**: {{用户选择的选项的具体内容}}

- **已发生的关键剧情**: {{历史重要情节}}

## 任务

根据上述信息，生成故事的下一步，包括所有参与 AI 角色的互动和反应。

要求：
1. 多个 AI 角色应有各自的反应
2. 体现角色之间的关系
3. 生成新的选择选项
```

### 多人×多AI (`multi-multi-up`)

```
## 上下文信息

- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}

- **用户的选择**: {{用户选择的选项的具体内容}}

- **已发生的关键剧情**: {{历史重要情节}}

## 任务

根据以上信息生成多人游戏的故事发展，体现所有参与者的互动。
```

## 🔄 用户提示变量替换

### 第一次调用时

| 变量 | 来源 | 示例 |
|------|------|------|
| `{{角色视角的故事背景}}` | 剧本的 `角色详细设定[0].角色视角的故事背景` 或 `角色池[0].角色视角的故事背景` | "你正在一个古老的魔法学院..." |
| `{{上一个选择点}}` | 剧本的 `角色详细设定[0].第一个选择点` 或 `角色池[0].第一个选择点` | "你需要选择你的主修科目" |
| `{{用户选择的选项的具体内容}}` | 用户实际选择的选项文本 | "选择了：严厉要求他立刻删除动态" |
| `{{历史重要情节}}` | 对话历史中最后 3 条 AI 响应（如果没有则显示"故事刚刚开始"） | "" （第一次为空） |

### 后续对话时

在后续对话中，这些变量会根据对话历史动态更新：

| 变量 | 更新逻辑 |
|------|---------|
| `{{角色视角的故事背景}}` | 保持不变（第一次的背景） |
| `{{上一个选择点}}` | 更新为上一步的选择点 |
| `{{用户选择的选项的具体内容}}` | 更新为用户最新的选择 |
| `{{历史重要情节}}` | 更新为最后 3 条 AI 响应的摘要 |

## 🔌 后端实现

### 1. 读取用户提示

在 `scriptService.ts` 中添加了 `getUserPromptTemplate()` 方法：

```typescript
async getUserPromptTemplate(scriptType: string): Promise<string> {
    // scriptType: 'single-single-up', 'single-multi-up', 'multi-multi-up'
    const doc = await db.collection('Prompts').doc('livestory').get();
    const userPrompt = doc.data()?.[scriptType];
    return userPrompt;
}
```

### 2. 变量替换

在 `game.ts` 的 `POST /sessions/:sessionId/choose` 路由中：

```typescript
// 转换为用户提示类型
const userPromptType = promptType.replace('-sp', '-up');
let userPromptTemplate = await scriptService.getUserPromptTemplate(userPromptType);

// 构建替换变量
replacements['角色视角的故事背景'] = firstDetail?.角色视角的故事背景 || '...';
replacements['上一个选择点'] = firstDetail?.第一个选择点 || '...';
replacements['用户选择的选项的具体内容'] = userInput || '...';
replacements['历史重要情节'] = session.dialogueHistory
    .filter(entry => entry.type === 'ai-response')
    .map(entry => entry.content)
    .slice(-3)  // 最后 3 条
    .join('\n');

// 替换变量
const customUserPrompt = scriptService.replacePromptTemplate(userPromptTemplate, replacements);
```

### 3. 传入 AI 服务

修改 `aiService.generateMultiCharacterStory()` 方法签名：

```typescript
async generateMultiCharacterStory(
    request: GenerationRequest,
    customSystemPrompt?: string,
    customUserPrompt?: string
): Promise<GenerationResponse> {
    const systemPrompt = customSystemPrompt || this.buildMultiCharacterPrompt(request);
    const userPrompt = customUserPrompt || this.buildUserPrompt(request);
    // ...
}
```

在 `game.ts` 中调用时传入：

```typescript
const generateResponse = await aiService.generateMultiCharacterStory(
    { /* request data */ },
    customSystemPrompt,
    customUserPrompt  // ← 新增
);
```

## 📊 完整的 AI 调用流程

```
用户提交选择
    ↓
获取脚本类型 (single-single-sp/sp/multi-multi-sp)
    ↓
从 Firebase 读取对应的系统提示 (single-single-sp)
    ↓
从 Firebase 读取对应的用户提示 (single-single-up)
    ↓
构建替换变量集合：
  - AI 角色信息
  - 脚本角色信息
  - 角色设定
  - 上下文信息（故事背景、选择点、用户选择、历史情节）
    ↓
替换系统提示中的变量
    ↓
替换用户提示中的变量
    ↓
调用 AI 模型：
  - system: 已替换的系统提示
  - user: 已替换的用户提示
    ↓
AI 生成故事
    ↓
通过 WebSocket 推送结果给前端
```

## 📝 Firebase 配置示例

在 Firebase Console 中，`Prompts.livestory` 文档应该包含：

```json
{
  "character": "【角色设定】\n姓名：{{姓名}}\n...",
  "single-single-sp": "你是一个故事叙述者...",
  "single-single-up": "## 上下文信息\n\n- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}\n...",
  "single-multi-sp": "你是一个多角色故事叙述者...",
  "single-multi-up": "## 上下文信息\n\n- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}\n...",
  "multi-multi-sp": "你是一个多用户多角色故事叙述者...",
  "multi-multi-up": "## 上下文信息\n\n- **上一个选择点**: {{角色视角的故事背景}}，{{上一个选择点}}\n..."
}
```

## ✅ 验证检查清单

- [ ] 在 `Prompts.livestory` 中添加了 `single-single-up` 字段
- [ ] 在 `Prompts.livestory` 中添加了 `single-multi-up` 字段
- [ ] 在 `Prompts.livestory` 中添加了 `multi-multi-up` 字段
- [ ] 后端代码编译成功
- [ ] 用户提示包含了所有必需的变量占位符
- [ ] 系统提示和用户提示都已配置

## 🎯 关键改进

1. **动态用户提示** - 用户提示不再硬编码，可随时更新
2. **上下文感知** - 提示包含完整的对话上下文
3. **灵活替换** - 所有变量都在运行时动态替换
4. **多模式支持** - 支持单人单AI、单人多AI、多人多AI三种模式

## 📞 支持

如有问题，请检查：
1. ✅ Firebase 中 `Prompts.livestory` 文档是否存在
2. ✅ 所有六个字段是否都已添加 (character, single-single-sp/up, single-multi-sp/up, multi-multi-sp/up)
3. ✅ 后端日志中是否显示成功读取用户提示
4. ✅ 用户提示变量是否正确替换

## 🚀 下一步

配置完 Firebase 后，系统将能够：
1. ✅ 读取系统提示和用户提示
2. ✅ 动态替换所有变量
3. ✅ 将两个提示同时传入 AI 模型
4. ✅ 生成更符合上下文的故事内容

