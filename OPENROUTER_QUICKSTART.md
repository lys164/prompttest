# ⚡ OpenRouter 快速启动

## 🚀 30秒配置

### 第1步：配置 API Key

编辑 `backend/.env` 文件：

```bash
cd /tmp/interactive-drama-game/backend
nano .env
# 或用你喜欢的编辑器打开
```

找到这一行：
```env
OPENROUTER_API_KEY=sk-or-v1-xxxx
```

替换为你的 API Key：
```env
OPENROUTER_API_KEY=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
```

### 第2步：启动应用

```bash
cd /tmp/interactive-drama-game
./start.sh
```

### 第3步：打开浏览器

访问：**http://localhost:3000** 🎮

## 🎮 立即体验

### 正常游玩
1. 进入首页
2. 选择一个剧本
3. 选择角色
4. 点击"▶️ 正常游玩"
5. 享受 AI 生成的故事！

### 调试模式 🔧
1. 进入游戏后
2. 点击"打开开发者面板"
3. 在**调试模式**中选择模型
4. 输入你的 Prompt
5. 点击"▶️ 测试 Prompt"
6. 查看 AI 的响应

### 对比模式 ⚖️
1. 进入游戏后
2. 点击"打开开发者面板"
3. 切换到**对比模式**
4. 选择 2 个或以上的模型
5. 输入 Prompt
6. 点击"🚀 开始对比"
7. 查看各模型的对比结果

## 🤖 10个模型

### 按速度排序
1. 🚄 **Gemini 2.5 Flash** - 最快
2. 🚄 **Grok 4 Fast** - 很快
3. 🚄 **LongCat Flash** - 快
4. ⚡ **GPT-5.1** - 快
5. ⚡ **Kimi K2** - 快

### 按质量排序
1. 👑 **Claude 4.5 Haiku** - 最佳推理
2. 👑 **GPT-5.1** - 最佳通用
3. ⭐ **DeepSeek V3.1** - 优秀推理
4. ⭐ **Qwen3 Next 80B** - 优秀通用
5. ⭐ **Kimi K2** - 优秀中文

### 按成本排序
1. 💰 **DeepSeek V3.1:free** - 免费
2. 💰 **Kimi K2:free** - 免费
3. 💰 **LongCat Flash:free** - 免费
4. 💵 **Gemini 2.5 Flash** - 低成本
5. 💵 **Grok 4 Fast** - 低成本

## 📊 实时对比

例如对比这3个模型的表现：

```
模型选择:
✓ GPT-5.1
✓ Claude 4.5 Haiku
✓ Gemini 2.5 Flash

Prompt:
"生成一个关于魔法师冒险的故事开头"

结果:
┌─────────────────────────────────┐
│ GPT-5.1: 430ms, 512 tokens      │
│ Claude 4.5: 580ms, 468 tokens   │
│ Gemini 2.5: 240ms, 521 tokens   │
└─────────────────────────────────┘
```

## 💡 使用建议

### 最佳实践
- **故事生成**: 使用 GPT-5.1（默认）
- **推理任务**: 使用 Claude 4.5 或 DeepSeek
- **快速处理**: 使用 Gemini 2.5 Flash
- **中文处理**: 使用 Kimi K2
- **成本优化**: 使用免费模型

### 调试技巧
1. 先用 Gemini 2.5 Flash 快速测试
2. 用 Claude 4.5 验证逻辑
3. 用 DeepSeek 进行深度分析
4. 记录最佳的 Prompt 组合

### 性能优化
- 调整温度参数测试效果差异
- 使用短 Prompt 节省 Token
- 并行对比多个模型
- 缓存优秀结果

## 🔍 监控面板

在对比模式中可以看到：
- 📊 **响应时间**: 各模型耗时
- 📈 **Token 消耗**: 计费参考
- ⚡ **性能排名**: 实时排序
- 🎯 **质量对比**: 输出内容比较

## 🎓 学习示例

### 示例1：故事创意
```
Prompt:
"为魔法学院剧本生成5个不同的故事开头选项"

对比:
- GPT-5.1: 创意丰富，细节多
- Claude 4.5: 逻辑清晰，结构好
- Gemini 2.5: 简洁有力，快速完成
```

### 示例2：对话生成
```
Prompt:
"生成一个NPC与玩家之间的有趣对话"

对比:
- DeepSeek: 深度对话，很有趣
- Qwen3: 自然流畅，贴切角色
- GPT-5.1: 综合最好，可作为参考
```

### 示例3：选项设计
```
Prompt:
"给出3个游戏选项，每个都能推动故事发展"

对比:
- Claude 4.5: 逻辑最强
- Kimi K2: 中文最好
- Gemini 2.5: 最快生成
```

## 🚨 常见问题

### Q: API Key 显示在文件中安全吗？
A: `.env` 文件不会被 Git 提交。确保：
```bash
# .gitignore 已包含
.env
.env.local
```

### Q: 如何更换 API Key？
A: 编辑 `backend/.env` 并重启应用

### Q: 免费模型有限制吗？
A: 有，请查看 OpenRouter 的定价页面

### Q: 可以一次测试所有10个模型吗？
A: 可以，但可能较慢。建议先选择3-5个

### Q: 模型不响应怎么办？
A: 检查 API Key、网络连接，或尝试其他模型

## 🔗 参考链接

- 📖 [完整集成指南](./OPENROUTER_INTEGRATION.md)
- 📚 [API 文档](./API_DOCS.md)
- 🏗️ [系统架构](./ARCHITECTURE.md)
- 🚀 [OpenRouter 官网](https://openrouter.ai)

## ✅ 验证集成

运行这个命令验证所有模型都已加载：

```bash
curl http://localhost:3001/api/dev/models

# 应该看到 12 个模型（10个OpenRouter + 2个OpenAI）
```

## 🎉 完成！

现在你可以：
- ✅ 用最新的 10 个模型生成故事
- ✅ 调试和测试 Prompt 效果
- ✅ 对比不同模型的表现
- ✅ 优化成本和质量平衡

**开始探索吧！** 🚀

---

有问题？查看 [完整集成指南](./OPENROUTER_INTEGRATION.md) 或 [项目文档](./README.md)

