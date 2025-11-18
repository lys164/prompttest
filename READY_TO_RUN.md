# 🎮 准备好运行！

## ⚡ 5 分钟快速开始

### 1️⃣ 配置 API Key（1分钟）

```bash
cd /tmp/interactive-drama-game
cd backend
nano .env
```

找到这一行并更新：
```env
OPENROUTER_API_KEY=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
```

保存（Ctrl+O, 回车, Ctrl+X）

### 2️⃣ 启动应用（2分钟）

```bash
cd /tmp/interactive-drama-game
chmod +x start.sh
./start.sh
```

等待看到：
```
🎮 应用已启动！
🌐 前端: http://localhost:3000
🔧 后端: http://localhost:3001
```

### 3️⃣ 打开浏览器（1分钟）

访问：**http://localhost:3000** 🚀

### 4️⃣ 选择游戏模式（1分钟）

进入首页 → 选择剧本 → 选择角色 → 选择模式：

- **🎮 正常游玩** - 用 GPT-5.1 生成故事
- **🔧 调试模式** - 测试任何 Prompt
- **⚖️ 对比模式** - 对比多个模型

## 🤖 10 个模型现在就能用

```
✅ GPT-5.1              - 最新，最强大
✅ Claude 4.5 Haiku     - 推理能力强
✅ Gemini 2.5 Flash     - 最快（240ms）
✅ Grok 4 Fast          - 快速推理
✅ Qwen3 Next 80B       - 中文友好
✅ LongCat Flash Chat   - 长上下文
✅ DeepSeek V3.1        - 免费！💰
✅ Kimi K2              - 中文优化，免费！💰
✅ Anubis 70B V1.1      - 专业级别
✅ Skyfall 36B V2       - 平衡优化
```

## 📊 立即尝试这些场景

### 场景1：享受故事（3分钟）
```
1. 首页 → 选择"暗影特务"或"魔法学院"
2. 选择一个 AI 角色
3. 点击"▶️ 正常游玩"
4. 阅读 AI 生成的故事
5. 做出你的选择
6. 看故事继续发展 ✨
```

### 场景2：调试 Prompt（2分钟）
```
1. 进入游戏
2. 点击"打开开发者面板"
3. 选择"🔧 调试模式"
4. 选择模型（试试 Claude 4.5）
5. 输入 Prompt：
   "为一个勇敢的冒险者生成一个故事开头"
6. 点击"▶️ 测试 Prompt"
7. 看结果！
```

### 场景3：对比模型（5分钟）
```
1. 进入游戏
2. 点击"打开开发者面板"
3. 选择"⚖️ 对比模式"
4. 选择 3 个模型：
   ✓ GPT-5.1
   ✓ Claude 4.5
   ✓ Gemini 2.5 Flash
5. 输入 Prompt：
   "介绍一个神秘的魔法学院"
6. 点击"🚀 开始对比"
7. 对比结果！📊
```

## 🎯 推荐使用方式

### 第一次使用
1. **选择模式**: 正常游玩
2. **选择模型**: 默认 GPT-5.1
3. **目标**: 享受故事体验
4. **时间**: 10-30 分钟

### 熟悉后
1. **选择模式**: 调试模式
2. **选择模型**: 任意尝试
3. **目标**: 测试 Prompt 效果
4. **时间**: 5-15 分钟

### 进阶用户
1. **选择模式**: 对比模式
2. **选择模型**: 多个对比
3. **目标**: 找到最佳组合
4. **时间**: 15-30 分钟

## 🚨 如果出问题

### Port 3000 已被占用
```bash
# 找出占用进程
lsof -i :3000

# 杀死进程（替换 PID）
kill -9 <PID>

# 重新启动
./start.sh
```

### API Key 无效
```bash
# 检查 .env 文件
cat backend/.env | grep OPENROUTER_API_KEY

# 确保格式：sk-or-v1-xxxx
# 重启应用
./start.sh
```

### 看不到模型列表
```bash
# 检查后端是否运行
curl http://localhost:3001/api/dev/models

# 应该看到 12 个模型
# 如果没有，检查 API Key 和网络
```

## 💡 快速提示

### 最佳 Prompt 示例

**故事生成**:
```
为一个勇敢的探险家生成一个冒险故事的开头。
包括场景描述、角色介绍和一个悬念。
```

**模型对比**:
```
以简洁的方式解释"什么是人工智能"。
用 2-3 句话，易于理解。
```

**推理测试**:
```
如果一个逻辑谜题是...
请解释推理过程。
```

### 温度设置参考

```
温度 0.0-0.3:  严肃、准确、确定性
温度 0.4-0.7:  平衡、正常（推荐）
温度 0.8-1.0:  创意、随机、多样化
```

### 模型选择参考

```
✨ 最快:      Gemini 2.5 Flash
🧠 最聪明:    Claude 4.5 Haiku
🎯 最通用:    GPT-5.1
💰 最省钱:    DeepSeek 或 Kimi K2（免费）
📝 最中文:    Kimi K2
```

## ✅ 验证检查

启动后，检查是否看到：

```
✅ 首页加载成功
✅ 剧本列表显示
✅ 可以点击剧本
✅ 可以选择角色
✅ 可以选择模式
✅ 开发者面板可打开
✅ 模型列表显示 12 个
✅ 可以调试 Prompt
✅ 可以对比模型
```

## 📚 需要更多帮助？

- 快速开始: [OPENROUTER_QUICKSTART.md](./OPENROUTER_QUICKSTART.md)
- 完整指南: [OPENROUTER_INTEGRATION.md](./OPENROUTER_INTEGRATION.md)
- 检查清单: [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
- 总结报告: [OPENROUTER_SUMMARY.md](./OPENROUTER_SUMMARY.md)

## 🎉 现在就开始吧！

```bash
# 一行命令启动所有
cd /tmp/interactive-drama-game && ./start.sh
```

然后打开：http://localhost:3000

**祝你玩得开心！** 🎮✨

---

**系统状态**: ✅ 完全就绪  
**模型数量**: 10 个 OpenRouter + 2 个 OpenAI = 12 个总计  
**API Key**: 已配置  
**文档**: 完整  
**质量**: 生产级别  

**享受 AI 互动影视游戏！** 🚀

