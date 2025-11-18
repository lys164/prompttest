# Firebase Prompts 配置指南

## 📋 正确的数据结构

系统从 **`Prompts.livestory`** 文档中读取所有系统提示。

### Firestore 结构

```
Prompts (集合)
└── livestory (文档)
    ├── character (字段) - 角色设定模板
    ├── single-single-sp (字段) - 单人×单AI 系统提示
    ├── single-multi-sp (字段) - 单人×多AI 系统提示
    └── multi-multi-sp (字段) - 多人×多AI 系统提示
```

## 📝 创建 `Prompts.livestory` 文档

### 步骤 1：打开 Firebase Console

访问 [Firebase Console](https://console.firebase.google.com)

### 步骤 2：创建 Prompts 集合（如果不存在）

1. 点击 **Firestore Database**
2. 点击 **创建集合** → 输入 `Prompts` → **创建**

### 步骤 3：创建 livestory 文档

1. 在 `Prompts` 集合中点击 **添加文档**
2. 文档 ID：`livestory`
3. 点击 **保存**

### 步骤 4：添加字段

现在向 `livestory` 文档添加以下字段（全部为字符串类型）：

#### 字段 1: `character` (角色设定模板)

**类型**: 字符串

**内容示例**:
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

#### 字段 2: `single-single-sp` (单人×单AI 系统提示)

**类型**: 字符串

**内容示例**:
```
你是一个故事叙述者和剧本编导。你需要根据用户的决策，继续推动故事发展。

当前故事背景：{{故事内容}}

参与角色设定：
{{角色设定}}

用户最后的选择：{{用户选择}}

请根据上述背景、角色设定和用户的选择，生成故事的下一步发展。

要求：
1. 保持故事连贯性和戏剧张力
2. 体现角色的性格特点和目标
3. 生成 3-5 个新的决策选项
4. 每个选项要有清晰的后果描述

回复格式（JSON）：
{
  "narrative": "故事的下一步内容（2-3段）",
  "nextChoicePoint": "下一个选择点的 ID",
  "newOptions": [
    {
      "id": "option_1",
      "文本": "选项 1 的描述",
      "后果描述": "选择此选项的后果"
    }
  ]
}
```

#### 字段 3: `single-multi-sp` (单人×多AI 系统提示)

**类型**: 字符串

**内容示例**:
```
你是一个多角色故事叙述者。多个 AI 角色将在这个故事中互动。

当前故事背景：{{故事内容}}

参与的角色设定：
{{角色设定}}

用户最后的选择：{{用户选择}}

请根据上述信息生成故事的下一步，包括所有 AI 角色的反应和互动。

要求：
1. 所有 AI 角色都应该有相应的回应
2. 体现角色之间的关系和冲突
3. 生成新的决策选项
4. 保持故事的连贯性

回复格式（JSON）：
{
  "narrative": "故事叙述（包含角色互动）",
  "characterResponses": [
    {
      "characterId": "char_id",
      "characterName": "角色名",
      "dialogue": "角色的对话或行动"
    }
  ],
  "newOptions": [...]
}
```

#### 字段 4: `multi-multi-sp` (多人×多AI 系统提示)

**类型**: 字符串

**内容示例**:
```
你是一个多用户多角色故事叙述者。

当前故事背景：{{故事内容}}

参与的角色（包括用户和 AI）：
{{角色设定}}

用户最后的选择：{{用户选择}}

生成故事的下一步发展，体现所有角色的互动。

回复格式（JSON）：
{
  "narrative": "故事叙述...",
  "newOptions": [...]
}
```

## 🔄 在 Firebase 中添加字段

### 方法 1：在 Console 中手动添加

1. 打开 `Prompts/livestory` 文档
2. 点击 **编辑** 或 **添加字段**
3. 字段名：`character` → 类型：**字符串** → 粘贴内容
4. 重复为其他字段

### 方法 2：使用 Firebase CLI

```bash
firebase firestore:import --export-dir=./backup
```

或者使用 Node.js 脚本直接设置：

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function setupPrompts() {
  await db.collection('Prompts').doc('livestory').set({
    'character': '【角色设定】\n姓名：{{姓名}}\n...',
    'single-single-sp': '你是一个故事叙述者...',
    'single-multi-sp': '你是一个多角色故事叙述者...',
    'multi-multi-sp': '你是一个多用户多角色故事叙述者...'
  });
  console.log('✅ Prompts 配置完成');
}

setupPrompts().catch(console.error);
```

## ✅ 验证配置

### 检查 Firestore 规则

确保规则允许后端读取 Prompts：

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Prompts/{document=**} {
      allow read: if request.auth != null;  // 已认证的用户
      // 或者对于后端服务账户：
      allow read: if true;  // 允许所有读取
    }
  }
}
```

### 测试 API

```bash
# 测试后端能否读取 Prompts
curl http://localhost:3001/health
# 应该返回: {"status":"ok",...}

# 测试时提交一个决策选择
# 如果看到 "✅ 成功获取 system prompt 模板" 日志，说明配置成功
```

## 📊 字段名称对应表

| 系统字段 | Firebase 字段 | 说明 |
|---------|-------------|------|
| 角色设定模板 | `character` | 用于构建 {{角色设定}} |
| 单人单AI 系统提示 | `single-single-sp` | 脚本类别: 【单人】【单AI】 |
| 单人多AI 系统提示 | `single-multi-sp` | 脚本类别: 【单人】【多AI】 |
| 多人多AI 系统提示 | `multi-multi-sp` | 脚本类别: 【多人】【多AI】 |

## 🎯 模板变量列表

### AI 角色变量（来自 livestory 集合）
- `{{姓名}}` → name
- `{{年龄}}` → age
- `{{国籍}}` → nationality
- `{{星座}}` → zodiac
- `{{MBTI}}` → mbti
- `{{和用户的身份}}` → relation_to_user
- `{{外貌描述}}` → appearance
- `{{面对未知的态度}}` → attitude_to_unknown
- `{{恐惧/软肋}}` → fear
- `{{喜好/特长}}` → likes（数组，自动 join）
- `{{讨厌的东西}}` → dislikes（数组，自动 join）
- `{{超能力}}` → superpower.name
- `{{等级}}` → superpower.level

### 故事变量
- `{{角色设定}}` → 所有参与角色的详细设定
- `{{故事内容}}` → 剧本的故事背景
- `{{用户选择}}` → 用户做出的决策

### 多角色变量
- `{{1_姓名}}` → 第二个角色的名字
- `{{2_年龄}}` → 第三个角色的年龄
- 等等...

## 🐛 常见问题

### Q: 为什么返回 500 错误？
A: 检查以下几点：
1. ✅ `Prompts` 集合存在
2. ✅ `livestory` 文档存在
3. ✅ 四个字段都已添加（`character`, `single-single-sp`, `single-multi-sp`, `multi-multi-sp`）
4. ✅ 字段类型都是**字符串**
5. ✅ Firestore 规则允许读取

### Q: 如何测试 Prompts 是否正确加载？
A: 查看后端日志：
```
📋 从 Prompts.livestory 获取 system prompt: single-single-sp
✅ 成功获取 system prompt 模板: single-single-sp
```

### Q: 可以修改 Prompts 文档吗？
A: 可以！修改后不需要重启后端，系统会实时读取。

### Q: 文字内容需要是中文吗？
A: 不一定。你可以用任何语言，但建议与脚本语言一致。

## 🎬 示例 Firestore 数据

完整的 `Prompts/livestory` 文档示例：

```json
{
  "character": "【角色设定】\n姓名：{{姓名}}\n年龄：{{年龄}}...",
  "single-single-sp": "你是一个故事叙述者...",
  "single-multi-sp": "你是一个多角色故事叙述者...",
  "multi-multi-sp": "你是一个多用户多角色故事叙述者..."
}
```

## ✨ 完成检查清单

- [ ] 创建了 `Prompts` 集合
- [ ] 创建了 `livestory` 文档
- [ ] 添加了 `character` 字段（字符串）
- [ ] 添加了 `single-single-sp` 字段（字符串）
- [ ] 添加了 `single-multi-sp` 字段（字符串）
- [ ] 添加了 `multi-multi-sp` 字段（字符串）
- [ ] 验证了 Firestore 规则允许读取
- [ ] 后端日志显示成功加载 system prompt

完成以上步骤后，系统就可以正常运行了！🚀

