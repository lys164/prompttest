# 🎭 角色变量映射功能 - 实现总结

## ✅ 完成的工作

### 1. **后端实现**

#### scriptService.ts 新增方法

```typescript
// 检测文本中的角色变量
detectCharacterVariables(text: string): string[]
  - 使用正则表达式 /{{(角色[A-Za-z0-9]+)}}/g
  - 返回所有找到的角色变量，如 ['角色A', '角色B']

// 检测剧本中的所有角色变量
detectScriptCharacterVariables(script: Script): { [key: string]: number }
  - 检测角色池中的所有文本字段
  - 检测角色详细设定中的所有文本字段
  - 返回变量及其索引映射，如 { 角色A: 0, 角色B: 1 }
```

#### types.ts 扩展

无需修改 - 现有的字段结构已支持变量映射

### 2. **前端实现**

#### CharacterSelector.tsx 新增功能

**检测函数：**
```typescript
// 检测文本中的角色变量
detectCharacterVariablesInText(text: string): string[]

// 检测剧本中的所有角色变量
detectScriptCharacterVariables(script: any): { [key: string]: number }
```

**状态管理：**
```typescript
const [variableMappings, setVariableMappings] = useState<Record<string, string>>({});
// 存储 { 角色A: 'user-char-id-1', 角色B: 'user-char-id-2' }
```

**逻辑切换：**
```typescript
const characterVariables = detectScriptCharacterVariables(script);
const hasCharacterVariables = Object.keys(characterVariables).length > 0;

// 根据 hasCharacterVariables 切换 UI 模式
- hasCharacterVariables = true  → 显示变量选择界面
- isSinglePlayerMultiAI = true  → 显示脚本角色选择界面
- 其他模式                    → 显示普通AI角色选择界面
```

**UI 改进：**
- 添加了"角色变量模式"的独立 UI 面板
- 为每个变量显示紫色高亮的变量名
- 每个变量有独立的下拉选择器
- 实时显示分配进度

**数据构建：**
```typescript
if (hasCharacterVariables) {
  finalCharacterMappings = variableNames.map((varName) => ({
    userAICharacterId: variableMappings[varName],
    scriptRoleId: varName,
    scriptCharacterName: varName,
    isVariableMapping: true,  // 标记这是变量映射
  }));
}
```

### 3. **集成流程**

#### 用户体验流程

1. **进入角色选择页面**
   - 系统检测剧本中的角色变量
   - 如果检测到变量，显示"🎭 请为以下角色变量分配AI角色"

2. **为每个变量选择AI角色**
   - 用户为 `{{角色A}}`、`{{角色B}}` 等选择对应的AI角色
   - 系统实时显示选择进度
   - 显示已选择的AI角色名

3. **提交选择**
   - 验证所有变量都已分配
   - 发送变量映射到后端

4. **后续处理**
   - 后端识别 `isVariableMapping: true` 标记
   - 在所有文本生成中使用变量映射
   - 将 `{{角色A}}` 替换为 `characterMappings[0].userAICharacter.姓名`
   - 在系统提示和用户提示中应用替换

## 🔄 工作原理

### 检测流程

```
Firebase 文档
    ↓
检测 {{角色A}}, {{角色B}} 等变量
    ↓
提取出 { 角色A: 0, 角色B: 1 }
    ↓
前端显示选择界面
    ↓
用户为每个变量选择 AI 角色
    ↓
提交 { 角色A: 'char-1', 角色B: 'char-2' }
```

### 替换流程

```
接收变量映射 { 角色A: char-1, 角色B: char-2 }
    ↓
获取对应的 AI 角色信息
    ↓
在故事内容中替换 {{角色A}} → 张三，{{角色B}} → 李四
    ↓
在系统提示中替换 {{角色A}} → 完整的张三信息
    ↓
在用户提示中替换所有变量
    ↓
调用 AI 模型生成故事
```

## 📋 代码变更清单

### 后端

✅ `backend/src/services/scriptService.ts`
- 添加 `detectCharacterVariables()` 方法
- 添加 `detectScriptCharacterVariables()` 方法
- 现有的 `replaceCharacterVariables()` 已支持变量映射

### 前端

✅ `frontend/components/game/CharacterSelector.tsx`
- 添加 `detectCharacterVariablesInText()` 函数
- 添加 `detectScriptCharacterVariables()` 函数
- 添加 `variableMappings` 状态
- 修改 `handleConfirm()` 处理变量映射情况
- 添加变量选择 UI 界面
- 更新进度提示逻辑
- 更新 UI 条件渲染

### 文档

✅ `CHARACTER_VARIABLES_FEATURE.md` - 完整功能文档
✅ `CHARACTER_VARIABLES_IMPLEMENTATION_SUMMARY.md` - 此文件

## 🧪 测试场景

### 场景 1: 单一变量
```json
Firebase: { "姓名": "{{角色A}}", ... }
用户选择: { 角色A: 'char-001' }
结果: { "姓名": "张三", ... }
```

### 场景 2: 多个变量
```json
Firebase: { 
  "角色A_目标": "...",
  "角色B_目标": "...",
  "对话": "{{角色A}}告诉{{角色B}}..."
}
用户选择: { 角色A: 'char-001', 角色B: 'char-002' }
结果: 所有 {{角色A}} 替换为张三，{{角色B}} 替换为李四
```

### 场景 3: 重复的变量
```json
Firebase: { 
  "介绍": "{{角色A}}是一个...",
  "行动": "{{角色A}}决定...",
}
用户选择: { 角色A: 'char-001' }
结果: 两处都被替换为同一个角色
```

### 场景 4: 变量与非变量混合
```json
Firebase: {
  "主角": "你",
  "支持者": "{{角色A}}"
}
处理: 只处理变量，"主角"保持不变
```

## 🚀 下一步优化建议

1. **错误处理**
   - 如果 AI 角色信息不完整，显示警告
   - 验证所有替换都成功完成

2. **性能优化**
   - 缓存已检测的变量（如果剧本不变）
   - 批量替换而不是逐个替换

3. **用户体验**
   - 显示变量在故事中的上下文（"张三将在这个场景中..."）
   - 允许用户快速预览替换结果

4. **扩展功能**
   - 支持更复杂的变量表达式（如 `{{角色A_名字}}`、`{{角色B_年龄}}`）
   - 支持条件替换（基于用户选择的不同替换文本）

## 📞 调试方法

### 前端调试

```javascript
// CharacterSelector.tsx 中的 console.log
console.log('🎭 检测到的角色变量:', characterVariables);
console.log('📌 角色变量映射:', variableMappings);
console.log('✅ 最终角色映射:', finalCharacterMappings);
```

### 后端调试

```javascript
// scriptService.ts 中的 console.log
console.log('🔍 检测到的变量:', detectedVars);

// game.ts 中的替换日志
console.log('🔄 替换前:', text);
console.log('🔄 替换后:', replacedText);
```

## ✨ 特点总结

✅ **自动检测** - 系统自动识别剧本中的角色变量
✅ **灵活映射** - 用户可为每个变量选择不同的AI角色
✅ **透明替换** - 所有变量都在后续操作中自动替换
✅ **一致体验** - 前后端逻辑一致，不会出现不同步
✅ **向后兼容** - 非变量剧本的工作流程完全不变

