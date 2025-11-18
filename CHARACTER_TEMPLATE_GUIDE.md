# Firebase Prompts 中的角色设定模板 (Character Template) 完整指南

## 📋 概述

系统现已支持从 Firebase Prompts 集合中读取角色设定模板 (`livestory.character` 字段)，并根据实际进入剧本的 AI 角色和脚本角色信息动态替换模板中的变量。

## 🎯 工作流程

```
用户选择角色并开始游戏
    ↓
后端读取 Prompts 文档的 systemPrompt 字段
    ↓
后端读取 Prompts 文档的 livestory.character 字段
    ↓
为每个参与的角色构建详细的角色设定
    ↓
将所有角色设定组合为 {{角色设定}} 变量
    ↓
替换 systemPrompt 中的所有变量
    ↓
将完整的 system prompt 发送给 AI
```

## 🏗️ Firebase Prompts 集合结构

### 文档结构

```json
{
  "_id": "single-single-sp",
  "systemPrompt": "你是一个故事叙述者...\n\n{{角色设定}}\n\n...",
  "livestory": {
    "character": "{{姓名}}，{{年龄}}岁，来自{{国籍}}...",
    "描述": "角色设定模板"
  },
  "其他字段": "..."
}
```

### livestory.character 字段内容示例

```
{{姓名}}，{{年龄}}岁，来自{{国籍}}，{{星座}}座，MBTI人格类型为{{MBTI}}，和用户是{{和用户的身份}}，拥有{{超能力}}的异能，目前掌控等级为{{等级}}。有着{{外貌描述}}的外表。作为{{MBTI}}性格的人，你热衷于{{喜好/特长}}，但对{{讨厌的东西}}深感厌恶。面对未知的事物时，{{姓名}}{{面对未知的态度}}。尽管拥有特殊能力，{{姓名}}内心深处仍然恐惧{{恐惧/软肋}}，这是{{姓名}}的软肋。

此刻，{{姓名}}进入了一个新的情境：{{角色简介}}。在这个故事中，{{姓名}}的目标是{{角色目标}}。{{姓名}}将以自己的方式——运用{{姓名}}的{{超能力}}能力、发挥{{喜好/特长}}的优势，同时警惕着{{讨厌的东西}}可能带来的干扰和{{恐惧/软肋}}可能造成的影响。
```

## 🔄 支持的模板变量

### AI 角色信息变量

| 变量名 | 来源 | 示例 | 说明 |
|-------|------|------|------|
| `{{姓名}}` | aiCharacter.姓名 | "张三" | 角色名称 |
| `{{年龄}}` | aiCharacter.年龄 | "25" | 年龄数字 |
| `{{国籍}}` | aiCharacter.国籍 | "中国" | 国籍 |
| `{{星座}}` | aiCharacter.星座 | "狮子座" | 星座 |
| `{{MBTI}}` | aiCharacter.MBTI | "INFP" | MBTI 性格类型 |
| `{{和用户的身份}}` | aiCharacter.和用户的身份 | "朋友" | 与用户的关系 |
| `{{外貌描述}}` | aiCharacter.外貌描述 | "长发飘飘..." | 外貌特征 |
| `{{喜好/特长}}` | aiCharacter.喜好特长 | "写作、绘画" | 喜好和特长（数组，以 `、` 分隔） |
| `{{讨厌的东西}}` | aiCharacter.讨厌的东西 | "谎言、背叛" | 讨厌的东西（数组，以 `、` 分隔） |
| `{{面对未知的态度}}` | aiCharacter.面对未知的态度 | "充满好奇" | 对未知事物的态度 |
| `{{恐惧/软肋}}` | aiCharacter.恐惧软肋 | "孤独" | 内心恐惧或软肋 |
| `{{超能力}}` | aiCharacter.超能力 | "心灵感应、瞬间移动" | 超能力名称列表（以 `、` 分隔） |
| `{{等级}}` | aiCharacter.超能力 | "5" | 超能力的最高等级 |

### 脚本角色信息变量

| 变量名 | 来源 | 说明 |
|-------|------|------|
| `{{角色简介}}` | roleDetail.角色简介 或 scriptCharacter.角色简介 | 角色的简介描述 |
| `{{角色目标}}` | scriptCharacter.角色目标 或 roleDetail.角色目标 | 角色在故事中的目标 |

## 📝 System Prompt 中的使用

### 完整示例

**Firebase Prompts 文档 (ID: single-single-sp)**

```json
{
  "systemPrompt": "你是一个沉浸式的故事叙述者。\n\n【角色设定】\n{{角色设定}}\n\n【故事背景】\n{{故事内容}}\n\n【你的任务】\n根据上面的角色设定和故事背景，生成故事的下一段。确保角色的行为符合其个性、目标和特殊能力。\n\n生成 JSON 格式的回应...",
  "livestory": {
    "character": "{{姓名}}，{{年龄}}岁，来自{{国籍}}，{{星座}}座，MBTI人格类型为{{MBTI}}，和用户是{{和用户的身份}}。有着{{外貌描述}}的外表。你热衷于{{喜好/特长}}，但对{{讨厌的东西}}深感厌恶。面对未知时，{{姓名}}{{面对未知的态度}}。你的软肋是{{恐惧/软肋}}。\n\n此刻，你进入了一个新的情境：{{角色简介}}。你的目标是{{角色目标}}。"
  }
}
```

### 替换后的结果

如果 AI 角色为 "张三"，脚本角色为 "侦探"，则 `{{角色设定}}` 会被替换为：

```
张三，25岁，来自中国，狮子座，MBTI人格类型为INFP，和用户是朋友。有着长发飘飘，气质优雅的外表。你热衷于写作、绘画，但对谎言、背叛深感厌恶。面对未知时，张三充满好奇。你的软肋是孤独。

此刻，你进入了一个新的情境：一位神秘的侦探。你的目标是破解这个案件的真相。
```

## 🛠️ 代码实现

### 后端方法

#### 1. `getCharacterTemplate(scriptType: string)`

**位置**: `backend/src/services/scriptService.ts`

从 Firebase Prompts 集合读取角色设定模板。

```typescript
const characterTemplate = await scriptService.getCharacterTemplate('single-single-sp');
```

#### 2. `buildCharacterDescription(template, aiCharacter, scriptCharacter, roleDetail)`

**位置**: `backend/src/services/scriptService.ts`

为单个角色构建详细的角色设定描述。

```typescript
const description = scriptService.buildCharacterDescription(
    template,
    aiCharacter,  // AI 角色信息
    scriptCharacter,  // 脚本角色信息
    roleDetail  // 角色详细设定
);
```

### 调用流程

**位置**: `backend/src/routes/game.ts` - `POST /sessions/:sessionId/choose`

```typescript
// 1. 获取角色设定模板
const characterTemplate = await scriptService.getCharacterTemplate(promptType);

// 2. 为每个参与角色构建设定
const characterDescriptions: string[] = participatingCharacters.map((pc) =>
    scriptService.buildCharacterDescription(
        characterTemplate,
        pc.userAICharacter,
        pc.scriptCharacter,
        pc.roleDetail
    )
);

// 3. 组合所有角色设定
replacements['角色设定'] = characterDescriptions.join('\n\n');

// 4. 替换 system prompt 中的变量
const customSystemPrompt = scriptService.replacePromptTemplate(
    systemPromptTemplate,
    replacements
);
```

## 🧠 变量替换逻辑

### 超能力处理

- **如果角色有超能力数组**:
  - `{{超能力}}`: 返回所有超能力名称 (用 `、` 分隔)
  - `{{等级}}`: 返回最高的超能力等级

- **如果角色无超能力**:
  - `{{超能力}}`: 返回 "无"
  - `{{等级}}`: 返回 "无"

### 数组字段处理

- `{{喜好/特长}}`: 多个项目用 `、` 分隔
- `{{讨厌的东西}}`: 多个项目用 `、` 分隔

### 多角色场景

当有多个角色时，`{{角色设定}}` 会包含所有角色的设定，用 `\n\n` 分隔：

```
【角色1的设定】

【角色2的设定】

【角色3的设定】
```

## ⚠️ 错误处理

### 找不到 Prompts 文档

```
❌ Prompts 集合中找不到 {{scriptType}} 文档
→ 抛出 Error: System prompt template not found for script type: {{scriptType}}
```

### 找不到 character 字段

```
❌ {{scriptType}} 文档的 livestory.character 字段不存在或为空
→ 抛出 Error: Character template field not found in {{scriptType}} document
```

## 📊 多角色示例

### 场景：单人多AI剧本，用户选择了两个 AI 角色

**AI 角色 1**:
```json
{
  "姓名": "张三",
  "年龄": 25,
  "国籍": "中国",
  "星座": "狮子座",
  "MBTI": "INFP",
  "和用户的身份": "朋友",
  "外貌描述": "长发飘飘，气质优雅",
  "喜好特长": ["写作", "绘画"],
  "讨厌的东西": ["谎言", "背叛"],
  "面对未知的态度": "充满好奇",
  "恐惧软肋": "孤独",
  "超能力": [
    {"名称": "心灵感应", "等级": 5},
    {"名称": "瞬间移动", "等级": 3}
  ]
}
```

**AI 角色 2**:
```json
{
  "姓名": "李四",
  "年龄": 30,
  "国籍": "美国",
  "星座": "金牛座",
  "MBTI": "ESTJ",
  "和用户的身份": "导师",
  "外貌描述": "短发干练，眼神锐利",
  "喜好特长": ["领导", "分析"],
  "讨厌的东西": ["懒惰", "混乱"],
  "面对未知的态度": "保持谨慎",
  "恐惧软肋": "失败",
  "超能力": [
    {"名称": "力量增幅", "等级": 6}
  ]
}
```

**生成的 {{角色设定}}**:

```
张三，25岁，来自中国，狮子座，MBTI人格类型为INFP，和用户是朋友，拥有心灵感应、瞬间移动的异能，目前掌控等级为5。有着长发飘飘，气质优雅的外表。作为INFP性格的人，你热衷于写作、绘画，但对谎言、背叛深感厌恶。面对未知的事物时，张三充满好奇。尽管拥有特殊能力，张三内心深处仍然恐惧孤独，这是张三的软肋。

此刻，张三进入了一个新的情境：侦探与线索。在这个故事中，张三的目标是找到真相。张三将以自己的方式——运用张三的心灵感应能力、发挥写作、绘画的优势，同时警惕着谎言可能带来的干扰和孤独可能造成的影响。

李四，30岁，来自美国，金牛座，MBTI人格类型为ESTJ，和用户是导师，拥有力量增幅的异能，目前掌控等级为6。有着短发干练，眼神锐利的外表。作为ESTJ性格的人，你热衷于领导、分析，但对懒惰、混乱深感厌恶。面对未知的事物时，李四保持谨慎。尽管拥有特殊能力，李四内心深处仍然恐惧失败，这是李四的软肋。

此刻，李四进入了一个新的情境：侦探与线索。在这个故事中，李四的目标是找到真相。李四将以自己的方式——运用李四的力量增幅能力、发挥领导、分析的优势，同时警惕着懒惰可能带来的干扰和失败可能造成的影响。
```

## 🎯 最佳实践

### 1. 模板设计

- ✅ 在模板中多次使用 `{{姓名}}` 以确保角色个性化
- ✅ 结合 AI 信息和脚本信息构建丰富的背景
- ✅ 使用角色特征创建动态的叙述方式

### 2. Firebase 结构

- ✅ 为每个脚本类型准备对应的 character 模板
- ✅ 确保 livestory 对象正确嵌套
- ✅ 模板应该包含所有 12+ 个支持的变量引用

### 3. 测试

- ✅ 测试单角色场景
- ✅ 测试多角色场景
- ✅ 检查 Firebase 日志中的错误信息
- ✅ 验证生成的 system prompt 长度和内容

## 📞 调试

### 查看后端日志

```
📋 从 Firebase Prompts.single-single-sp 获取角色设定模板
✅ 成功获取角色设定模板
📋 获取角色设定模板: single-single-sp
✅ 角色设定已生成，共 1 个角色
✅ System prompt 准备就绪，长度: XXXX
```

### 验证替换结果

可以在后端代码中添加日志查看替换结果：

```typescript
console.log('📝 角色设定内容:');
console.log(replacements['角色设定']);
console.log('📝 完整的 system prompt:');
console.log(customSystemPrompt);
```

## ✅ 完成状态

✅ 已实现角色设定模板读取
✅ 已实现动态角色描述构建
✅ 已实现完整的变量替换
✅ 支持单角色和多角色场景
✅ 已集成到游戏流程中

