# Firebase livestory 集合中的角色设定模板说明

## 📋 概述

系统现在直接从 Firebase `livestory` 集合中读取角色设定模板，不使用任何默认模板或备用数据。

## 🔄 数据读取流程

```
用户开始游戏
    ↓
确定脚本类型 (single-single-sp / single-multi-sp / multi-multi-sp)
    ↓
从 Firebase livestory 集合读取对应文档
    ├─ 文档 ID: single-single-sp (或其他类型)
    └─ 获取 character 字段
    ↓
提取角色设定模板字符串
    ↓
为每个参与的 AI 角色替换模板中的变量
    ↓
组合所有角色设定为 {{角色设定}} 变量
    ↓
替换 systemPrompt 中的 {{角色设定}}
    ↓
生成故事
```

## 📝 Firebase livestory 集合结构

### 文档格式

每个脚本类型在 `livestory` 集合中有一个对应的文档：

**文档 ID**: `single-single-sp` (或 `single-multi-sp`、`multi-multi-sp`)

**文档内容**:
```json
{
  "character": "{{姓名}}，{{年龄}}岁，来自{{国籍}}，{{星座}}座，MBTI人格类型为{{MBTI}}，...",
  "systemPrompt": "你是一个故事叙述者...\n\n{{角色设定}}\n\n...",
  "其他字段": "..."
}
```

### character 字段

这个字段包含完整的角色设定模板，其中包含以下变量：

```
{{姓名}}，{{年龄}}岁，来自{{国籍}}，{{星座}}座，MBTI人格类型为{{MBTI}}，和用户是{{和用户的身份}}，拥有{{超能力}}的异能，目前掌控等级为{{等级}}。有着{{外貌描述}}的外表。作为{{MBTI}}性格的人，你热衷于{{喜好/特长}}，但对{{讨厌的东西}}深感厌恶。面对未知的事物时，{{姓名}}{{面对未知的态度}}。尽管拥有特殊能力，{{姓名}}内心深处仍然恐惧{{恐惧/软肋}}，这是{{姓名}}的软肋。

此刻，{{姓名}}进入了一个新的情境：{{角色简介}}。在这个故事中，{{姓名}}的目标是{{角色目标}}。{{姓名}}将以自己的方式——运用{{姓名}}的{{超能力}}能力、发挥{{喜好/特长}}的优势，同时警惕着{{讨厌的东西}}可能带来的干扰和{{恐惧/软肋}}可能造成的影响。
```

## 🔧 代码实现

### getCharacterTemplate() 方法

**位置**: `backend/src/services/scriptService.ts` (第 83-103 行)

```typescript
async getCharacterTemplate(scriptType: string): Promise<string> {
    console.log(`📋 从 Firebase livestory.${scriptType} 获取角色设定模板`);
    
    const doc = await db.collection('livestory').doc(scriptType).get();

    if (!doc.exists) {
        console.error(`❌ livestory 集合中找不到 ${scriptType} 文档`);
        throw new Error(`Character template not found in livestory collection for: ${scriptType}`);
    }

    const data = doc.data();
    const characterTemplate = data?.character || '';

    if (!characterTemplate) {
        console.error(`❌ ${scriptType} 文档中找不到 character 字段`);
        throw new Error(`Character field not found in livestory.${scriptType} document`);
    }

    console.log(`✅ 成功从 livestory.${scriptType} 获取角色设定模板`);
    return characterTemplate;
}
```

### 特点

- ✅ 严格模式：找不到数据直接抛出错误
- ✅ 清晰的错误消息
- ✅ 无任何备用或默认值
- ✅ 直接从 Firebase livestory 集合读取

## 📊 支持的脚本类型

| 脚本类型 | 文档 ID | 说明 |
|---------|--------|------|
| 单人单AI | `single-single-sp` | 单个玩家与单个 AI 角色 |
| 单人多AI | `single-multi-sp` | 单个玩家与多个 AI 角色 |
| 多人多AI | `multi-multi-sp` | 多个玩家与多个 AI 角色 |

## ⚠️ 错误处理

如果出现任何错误，系统会：
1. 记录错误信息到后端日志
2. 返回 500 错误给前端
3. **不会**使用任何备用或默认值

### 可能的错误

| 错误 | 原因 |
|------|------|
| `livestory 集合中找不到 {{scriptType}} 文档` | Firebase 中没有该脚本类型的文档 |
| `{{scriptType}} 文档中找不到 character 字段` | 文档存在但没有 character 字段 |

## 📝 日志输出

### 成功情况
```
📋 从 Firebase livestory.single-single-sp 获取角色设定模板
✅ 成功从 livestory.single-single-sp 获取角色设定模板
✅ 角色设定已生成，共 1 个角色
✅ System prompt 准备就绪，长度: 2048
```

### 错误情况
```
📋 从 Firebase livestory.single-single-sp 获取角色设定模板
❌ livestory 集合中找不到 single-single-sp 文档
```

## ✅ Firebase 数据检查

确保以下内容已在 Firebase 中配置：

1. **livestory 集合存在**
2. **至少有以下三个文档**:
   - ID: `single-single-sp`，包含 `character` 字段
   - ID: `single-multi-sp`，包含 `character` 字段
   - ID: `multi-multi-sp`，包含 `character` 字段
3. **每个文档的 `character` 字段**:
   - 不为空
   - 包含所有必需的变量占位符
   - 格式正确

## 🔍 故障排查

### 问题：500 错误

**原因**: Firebase livestory 集合中缺少对应的文档或 character 字段

**解决方案**:
1. 检查 Firebase livestory 集合
2. 确保有对应的文档（single-single-sp、single-multi-sp、multi-multi-sp）
3. 确保每个文档都有 `character` 字段
4. 确保 `character` 字段不为空

### 问题：后端日志显示错误

**查看详细日志**:
```
❌ livestory 集合中找不到 {{scriptType}} 文档
```

检查:
- 文档 ID 是否正确
- 是否在正确的集合中（livestory，不是 Prompts）

## 🎯 工作流总结

1. **用户开始游戏** → 选择脚本和 AI 角色
2. **后端确定脚本类型** → 根据 `剧本类别` 字段
3. **从 Firebase 读取数据**:
   - `Prompts.{{scriptType}}.systemPrompt` → 系统提示
   - `livestory.{{scriptType}}.character` → 角色设定模板
4. **替换变量**:
   - 使用实际的 AI 角色信息替换模板中的变量
   - 用脚本角色信息替换相关变量
5. **生成故事** → 将完整的 system prompt 发送给 AI

## 📌 关键点

- ✅ **无默认值**: 所有数据必须来自 Firebase
- ✅ **严格模式**: 找不到数据直接报错
- ✅ **清晰的源头**: 
  - systemPrompt 来自 `Prompts` 集合
  - character 模板来自 `livestory` 集合
- ✅ **完整的错误信息**: 日志清晰显示哪里出错

## ✨ 完成状态

✅ 移除所有默认模板
✅ 移除所有备用数据
✅ 严格模式已启用
✅ 直接从 Firebase livestory 读取
✅ 代码已编译并重启

