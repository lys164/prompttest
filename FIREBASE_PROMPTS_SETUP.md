# Firebase Prompts 集合设置指南

## 📋 概述

系统需要在 Firebase Firestore 中创建 `Prompts` 集合，包含系统提示模板和角色设定模板。

## 🔧 设置步骤

### 1. 在 Firestore 中创建 `Prompts` 集合

### 2. 创建系统提示文档

#### 2.1 `single-single-sp` 文档（单人×单AI）

```
集合：Prompts
文档：single-single-sp

字段：
- systemPrompt: (string)
```

**示例内容**：
```
你是一个故事叙述者和剧本编导。你需要根据用户的决策，继续推动故事发展。

当前故事背景：{{故事内容}}

参与角色设定：
{{角色设定}}

用户最后的选择：{{用户选择}}

请根据上述背景、角色设定和用户的选择，生成故事的下一步发展。要求：
1. 保持故事连贯性
2. 体现角色的性格特点
3. 生成 3-5 个新的决策选项
4. 每个选项要有清晰的后果描述

回复格式：
{
  "narrative": "故事的下一步内容...",
  "nextChoicePoint": "下一个选择点的 ID",
  "newOptions": [
    {
      "id": "option1",
      "文本": "选项 1 文本",
      "后果描述": "选择此选项的后果"
    }
  ]
}
```

#### 2.2 `single-multi-sp` 文档（单人×多AI）

```
集合：Prompts
文档：single-multi-sp

字段：
- systemPrompt: (string)
```

**示例内容**：
```
你是一个多角色故事叙述者。多个 AI 角色将参与这个故事。

当前故事背景：{{故事内容}}

参与的角色设定：
{{角色设定}}

用户最后的选择：{{用户选择}}

根据上述信息生成故事的下一步，包括所有 AI 角色的反应和互动。

回复格式：
{
  "narrative": "故事叙述...",
  "characterResponses": [
    {
      "characterId": "char1",
      "characterName": "角色名",
      "dialogue": "角色的对话"
    }
  ],
  "newOptions": [...]
}
```

#### 2.3 `multi-multi-sp` 文档（多人×多AI）

```
集合：Prompts
文档：multi-multi-sp

字段：
- systemPrompt: (string)
```

**示例内容**：
```
你是一个多用户多角色故事叙述者。

当前故事背景：{{故事内容}}

参与的角色（包括用户和 AI）：
{{角色设定}}

用户最后的选择：{{用户选择}}

生成故事的下一步发展，体现所有角色的互动。
```

### 3. 创建角色设定模板文档

#### 3.1 `livestory` 文档（在 Prompts 集合中）

```
集合：Prompts
文档：livestory

字段：
- character: (string)
```

**示例内容**：

```
【角色设定】

姓名：{{姓名}}
年龄：{{年龄}}
国籍：{{国籍}}
星座：{{星座}}
MBTI：{{MBTI}}

【身份与关系】
和用户的身份：{{和用户的身份}}

【外貌与气质】
外貌描述：{{外貌描述}}

【性格特征】
面对未知的态度：{{面对未知的态度}}
恐惧/软肋：{{恐惧/软肋}}
喜好/特长：{{喜好/特长}}
讨厌的东西：{{讨厌的东西}}

【超能力】
超能力：{{超能力}}
能力等级：{{等级}}

【角色在故事中的角色】
角色简介：{{角色简介}}
角色目标：{{角色目标}}
```

## 📝 变量替换说明

系统会将以下变量替换为实际值：

### AI 角色变量（来自 `livestory` 集合）
- `{{姓名}}` → `name`
- `{{年龄}}` → `age`
- `{{国籍}}` → `nationality`
- `{{星座}}` → `zodiac`
- `{{MBTI}}` → `mbti`
- `{{和用户的身份}}` → `relation_to_user`
- `{{外貌描述}}` → `appearance`
- `{{面对未知的态度}}` → `attitude_to_unknown`
- `{{恐惧/软肋}}` → `fear`
- `{{喜好/特长}}` → `likes`
- `{{讨厌的东西}}` → `dislikes`
- `{{超能力}}` → `superpower.name`
- `{{等级}}` → `superpower.level`

### 故事变量
- `{{角色设定}}` → 所有参与角色的详细设定
- `{{故事内容}}` → 剧本的故事背景
- `{{用户选择}}` → 用户做出的决策

### 多角色变量
- `{{1_姓名}}`, `{{2_姓名}}` 等 → 第二个、第三个角色的名字
- `{{1_年龄}}`, `{{2_年龄}}` 等 → 其他角色的年龄

## 🔌 API 字段映射

### livestory 集合中的 AI 角色数据格式
```json
{
  "name": "明日香",
  "age": 24,
  "nationality": "日本",
  "zodiac": "金牛座",
  "mbti": "INFP",
  "relation_to_user": "密友",
  "appearance": "黑长直头发，温和的笑容",
  "attitude_to_unknown": "充满好奇",
  "fear": "失去亲近的人",
  "likes": ["绘画", "古典音乐"],
  "dislikes": ["谎言", "冷漠"],
  "superpower": {
    "name": "时间感知",
    "level": 7
  }
}
```

## ✅ 验证检查清单

- [ ] 创建了 `Prompts` 集合
- [ ] 创建了 `single-single-sp` 文档，包含 `systemPrompt` 字段
- [ ] 创建了 `single-multi-sp` 文档，包含 `systemPrompt` 字段
- [ ] 创建了 `multi-multi-sp` 文档，包含 `systemPrompt` 字段
- [ ] 创建了 `livestory` 文档，包含 `character` 字段
- [ ] 所有文档都有正确的字段名（英文）
- [ ] Firestore 规则允许后端服务账户读取 `Prompts` 集合

## 🔐 Firestore 规则

确保规则中包含对 `Prompts` 的读取权限：

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Prompts/{document=**} {
      allow read: if true;
    }
  }
}
```

## 🐛 故障排查

### 问题：500 Internal Server Error
**原因**：`Prompts` 集合或相关文档不存在
**解决**：按照上述步骤创建所有必需的文档

### 问题：字段未找到
**原因**：字段名不匹配（例如用了中文字段名而不是英文）
**解决**：确认所有字段名都是英文，如 `systemPrompt` 而不是 `系统提示`

### 问题：变量替换失败
**原因**：模板中的变量名不正确
**解决**：检查变量名是否与上面的列表完全匹配，包括括号 `{{}}`

## 📞 支持

如有问题，请检查：
1. 后端日志中的错误信息
2. Firebase Console 中的数据结构
3. Firestore 规则是否允许读取

