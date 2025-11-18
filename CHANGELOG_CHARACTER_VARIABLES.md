# 📝 角色变量映射功能 - 变更日志

## 版本: 2.0.0 - 角色变量映射支持

### 🎯 功能描述

新增**角色变量映射**功能，允许Firebase中的剧本使用 `{{角色A}}`、`{{角色B}}` 等变量代替固定的AI角色名。用户在选择AI角色时，系统会自动检测这些变量，并让用户为每个变量分别选择对应的AI角色。后续所有的故事生成、系统提示和用户提示都会自动用实际的AI角色信息替换这些变量。

---

## 📦 文件变更详情

### 后端 (Backend)

#### ✅ `backend/src/services/scriptService.ts`

**新增方法：**

1. **`detectCharacterVariables(text: string): string[]`**
   - 功能：从文本中提取所有角色变量
   - 支持格式：`{{角色A}}`、`{{角色B}}`、`{{角色0}}`、`{{角色1}}` 等
   - 返回：去重的变量数组

   ```typescript
   detectCharacterVariables('{{角色A}}和{{角色B}}在这里')
   // 返回: ['角色A', '角色B']
   ```

2. **`detectScriptCharacterVariables(script: Script): { [key: string]: number }`**
   - 功能：检测整个剧本中的所有角色变量
   - 检查范围：
     - 角色池（`script.角色池`）中的所有字段
     - 角色详细设定（`script.角色详细设定`）中的所有字段
   - 返回：变量名到索引的映射

   ```typescript
   detectScriptCharacterVariables(script)
   // 返回: { 角色A: 0, 角色B: 1, 角色C: 2 }
   ```

**现有方法改进：**

- `replaceCharacterVariables()` - 已支持变量映射，无需修改

---

### 前端 (Frontend)

#### ✅ `frontend/components/game/CharacterSelector.tsx`

**新增工具函数：**

1. **`detectCharacterVariablesInText(text: string): string[]`**
   - 前端版本的变量检测
   - 与后端逻辑完全一致

2. **`detectScriptCharacterVariables(script: any): { [key: string]: number }`**
   - 前端版本的剧本检测
   - 与后端逻辑完全一致

**新增状态：**

```typescript
const [variableMappings, setVariableMappings] = useState<Record<string, string>>({});
// 存储用户的变量映射选择：{ 角色A: 'char-id-1', 角色B: 'char-id-2' }

const characterVariables = detectScriptCharacterVariables(script);
const hasCharacterVariables = Object.keys(characterVariables).length > 0;
// 标记是否存在角色变量
```

**修改的方法：**

1. **`handleConfirm()` - 增强逻辑**
   - 添加了 `hasCharacterVariables` 分支
   - 当存在角色变量时：
     - 验证所有变量都已分配
     - 构建变量映射的最终格式：
       ```typescript
       {
         userAICharacterId: 'char-id',
         scriptRoleId: '角色A',  // 使用变量名
         scriptCharacterName: '角色A',
         isVariableMapping: true,  // 标记为变量映射
       }
       ```

**UI 改进：**

1. **进度提示增强**
   ```
   之前: 已选择: X / Y 个角色
   现在: 已分配: X / Y 个角色变量 (当检测到变量时)
   ```

2. **新增"角色变量选择"界面**
   - 显示 "🎭 请为以下角色变量分配AI角色"
   - 为每个变量显示紫色高亮的变量名
   - 每个变量有独立的下拉选择器
   - 实时显示已分配的AI角色名和MBTI

3. **条件渲染改进**
   ```typescript
   // 角色变量模式
   {hasCharacterVariables && <VariableSelector ... />}
   
   // 单人多AI模式（非变量）
   {!hasCharacterVariables && isSinglePlayerMultiAI && <ScriptCharacterSelector ... />}
   
   // 普通选择模式（非变量）
   {!hasCharacterVariables && !isSinglePlayerMultiAI && <AICharacterGrid ... />}
   ```

---

## 🔄 工作流程

### 用户看到的流程

```
1. 进入剧本详情页
        ↓
2. 点击"开始游玩"
        ↓
3. 系统检测是否存在角色变量
        ↓
   ├─ 存在变量 → 显示变量选择界面
   │  ├─ 为 {{角色A}} 选择：张三
   │  ├─ 为 {{角色B}} 选择：李四
   │  └─ 点击"开始游戏"
   │
   ├─ 单人多AI → 显示脚本角色选择界面
   │  ├─ 为 "主角" 选择：张三
   │  ├─ 为 "配角" 选择：李四
   │  └─ 点击"开始游戏"
   │
   └─ 其他情况 → 显示AI角色网格选择
      ├─ 选择 1 个或多个 AI 角色
      └─ 点击"开始游戏"
        ↓
4. 进入角色初始化界面
        ↓
5. 进入游戏（故事内容已用实际角色信息替换变量）
```

### 后端处理流程

```
接收来自前端的选择
        ↓
识别 isVariableMapping: true
        ↓
构建角色映射 { 角色A: char-1-info, 角色B: char-2-info }
        ↓
替换故事中的所有变量
        ↓
替换系统提示中的 {{角色A}} → 张三的完整信息
        ↓
替换用户提示中的所有变量
        ↓
调用AI模型生成故事（包含已替换的内容）
```

---

## 🧪 测试场景

### ✅ 测试 1: 基础变量检测
```
输入: 包含 {{角色A}} 和 {{角色B}} 的剧本
预期: 
- 前端检测到 2 个变量
- 显示变量选择界面
- 用户可为每个变量选择AI角色
```

### ✅ 测试 2: 多个相同变量
```
输入: 
- 角色简介: "{{角色A}}是..."
- 故事背景: "{{角色A}}来到了..."
- 选择点: "{{角色A}}建议..."

预期:
- 只需选择一次 {{角色A}}
- 所有3处都被替换为同一个AI角色
```

### ✅ 测试 3: 变量与非变量混合
```
输入:
- 主角角色名: "你"
- 配角角色名: "{{角色A}}"

预期:
- 只检测到 {{角色A}}
- "你" 保持不变
```

### ✅ 测试 4: 故事生成中的变量替换
```
输入: 
- 系统提示: "{{角色A}}是一个 {{年龄}} 岁的..."（年龄来自AI角色信息）
- 用户提示: "{{角色A}}建议你..."
- 用户选择: {{角色A}} = 张三

预期:
- AI接收到："张三是一个28岁的..."
- AI接收到："张三建议你..."
- 生成的故事中出现"张三"而不是"{{角色A}}"
```

---

## ⚙️ 配置说明

无需额外配置，系统自动检测和处理角色变量。

---

## 📊 性能影响

- **检测成本**：O(n)，其中n是文本长度
- **替换成本**：O(m)，其中m是变量数量
- **内存增加**：最多 10 个变量映射记录（每条 ~100 字节）

**总体**：性能影响极小，可忽略不计

---

## 🔒 向后兼容性

✅ **完全向后兼容**
- 不含变量的剧本工作流程完全不变
- 现有的单人多AI选择逻辑保持不变
- 现有的AI角色选择逻辑保持不变

---

## 🐛 已知问题

暂无已知问题。

---

## 🚀 未来改进

### 计划的功能
1. **变量上下文展示**
   - 在选择器中显示变量在故事中的使用上下文
   - 帮助用户更好地理解选择

2. **高级变量表达式**
   - 支持 `{{角色A_年龄}}`、`{{角色B_国籍}}` 等更细粒度的变量
   - 支持条件替换

3. **验证和预览**
   - 替换前预览最终效果
   - 验证所有替换是否成功

4. **错误恢复**
   - 如果某个AI角色信息不完整，显示清晰的错误提示
   - 允许用户修改选择

---

## 📚 相关文档

- `CHARACTER_VARIABLES_FEATURE.md` - 功能详细文档
- `CHARACTER_VARIABLES_IMPLEMENTATION_SUMMARY.md` - 实现总结
- `DIALOGUE_LOG_FEATURE.md` - 对话日志调试功能

---

## 👤 开发者信息

**实现日期**: 2025-11-18
**版本**: 2.0.0
**状态**: ✅ 已完成并测试

