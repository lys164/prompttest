# 🔗 OpenRouter 集成指南

## 📋 概述

应用已成功集成 **OpenRouter** 的 10 个强大的 AI 模型，支持完整的多模型对比功能。

## 🚀 快速配置

### 第1步：配置 OpenRouter API Key

编辑 `backend/.env` 文件，添加你的 OpenRouter API Key：

```env
# OpenRouter API Key - 从 https://openrouter.ai 获取
OPENROUTER_API_KEY=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
```

你已经有了 API Key：
```
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
```

### 第2步：重启应用

```bash
cd /tmp/interactive-drama-game
./start.sh
```

或手动重启后端：
```bash
cd backend
npm run dev
```

## 🤖 支持的模型

应用现在支持以下 10 个 OpenRouter 模型：

### 1. **GPT-5.1** 🌟
- **ID**: `openai/gpt-5.1-chat`
- **提供商**: OpenAI
- **描述**: 最新的通用大型语言模型
- **用途**: 故事生成（默认模型）

### 2. **Claude 4.5 Haiku**
- **ID**: `anthropic/claude-haiku-4.5`
- **提供商**: Anthropic
- **描述**: 小型但强大的推理模型
- **用途**: 精确推理和分析

### 3. **Gemini 2.5 Flash**
- **ID**: `google/gemini-2.5-flash-preview-09-2025`
- **提供商**: Google
- **描述**: 快速的多模态模型
- **用途**: 高速处理和理解

### 4. **Grok 4 Fast**
- **ID**: `x-ai/grok-4-fast`
- **提供商**: X AI
- **描述**: 快速推理的模型
- **用途**: 实时应答和快速处理

### 5. **Qwen3 Next 80B**
- **ID**: `qwen/qwen3-next-80b-a3b-instruct`
- **提供商**: Alibaba
- **描述**: 阿里大规模语言模型
- **用途**: 强大的通用模型

### 6. **LongCat Flash Chat**
- **ID**: `meituan/longcat-flash-chat:free`
- **提供商**: Meituan
- **描述**: 长上下文处理能力
- **用途**: 长对话和复杂场景

### 7. **DeepSeek V3.1**
- **ID**: `deepseek/deepseek-chat-v3.1:free`
- **提供商**: DeepSeek
- **描述**: 深度学习优化的模型
- **用途**: 深度推理和分析

### 8. **Kimi K2**
- **ID**: `moonshotai/kimi-k2:free`
- **提供商**: Moonshot
- **描述**: 中文优化的大型模型
- **用途**: 中文处理（特别优化）

### 9. **Anubis 70B V1.1**
- **ID**: `thedrummer/anubis-70b-v1.1`
- **提供商**: Drummer
- **描述**: 专业优化的70B模型
- **用途**: 专业应用和高性能需求

### 10. **Skyfall 36B V2**
- **ID**: `thedrummer/skyfall-36b-v2`
- **提供商**: Drummer
- **描述**: 平衡性能与效率的模型
- **用途**: 均衡应用

## 🎮 使用场景

### 正常游玩模式
- 使用默认模型（**GPT-5.1**）生成故事
- 提供最佳的故事叙述体验
- 自动处理 OpenRouter API 调用

### 调试模式 🔧
- 选择任意单个模型测试
- 调整温度参数（0-1）
- 查看模型输出和 Token 消耗
- 快速验证 Prompt 效果

### 对比模式 ⚖️
- 同时测试多个模型
- 比较响应质量和速度
- 查看 Token 成本
- 帮助选择最佳模型

## 📊 API 端点

### 获取所有模型
```bash
GET http://localhost:3001/api/dev/models

# 响应示例
{
  "success": true,
  "data": [
    {
      "id": "openai/gpt-5.1-chat",
      "name": "GPT-5.1",
      "provider": "OpenRouter (OpenAI)",
      "description": "最新的通用大型语言模型",
      "category": "openrouter"
    },
    // ... 更多模型
  ],
  "total": 12
}
```

### 调试单个模型
```bash
POST http://localhost:3001/api/dev/debug

Body:
{
  "prompt": "你是一个故事生成器...",
  "model": "openai/gpt-5.1-chat",
  "temperature": 0.7
}
```

### 对比多个模型
```bash
POST http://localhost:3001/api/dev/compare

Body:
{
  "prompt": "生成一个有趣的故事开头...",
  "models": [
    "openai/gpt-5.1-chat",
    "anthropic/claude-haiku-4.5",
    "google/gemini-2.5-flash-preview-09-2025"
  ]
}
```

## 🔑 关键特性

### ✨ 智能模型路由
- 自动检测模型类型（OpenRouter 或 OpenAI）
- 动态选择 API 端点
- 统一的错误处理

### ✨ 并行处理
- 多模型同时调用
- 异步等待结果
- 性能监控

### ✨ 完整的错误处理
- API 错误捕获
- 详细的错误信息
- 优雅的降级处理

### ✨ 灵活的配置
- 支持环境变量配置
- 动态模型切换
- 参数调节

## 🔐 安全建议

1. **API Key 管理**
   - 永远不要在代码中硬编码 API Key
   - 使用 `.env` 文件存储敏感信息
   - 定期轮换 API Key

2. **请求头配置**
   ```
   Authorization: Bearer <OPENROUTER_API_KEY>
   HTTP-Referer: https://drama-game.ai
   X-Title: AI Interactive Drama Game
   ```

3. **速率限制**
   - 监控 API 使用量
   - 实施请求队列
   - 设置超时时间

## 📈 性能对比

| 模型 | 速度 | 成本 | 质量 |
|------|------|------|------|
| GPT-5.1 | 快 | 中等 | 优秀 |
| Claude 4.5 | 中等 | 中等 | 卓越 |
| Gemini 2.5 Flash | 很快 | 低 | 良好 |
| Grok 4 Fast | 很快 | 低 | 良好 |
| DeepSeek V3.1 | 中等 | 低 | 优秀 |
| Kimi K2 | 快 | 低 | 优秀 |
| Qwen3 Next 80B | 中等 | 低 | 优秀 |
| Anubis 70B | 中等 | 低 | 良好 |
| Skyfall 36B | 快 | 低 | 良好 |
| LongCat Flash | 快 | 低 | 良好 |

## 🛠️ 故障排查

### 问题：API Key 无效
**解决方案**：
1. 检查 `.env` 文件中的 API Key
2. 确保 Key 前缀为 `sk-or-v1-`
3. 从 https://openrouter.ai 重新生成 Key

### 问题：请求超时
**解决方案**：
1. 检查网络连接
2. 增加超时时间
3. 尝试其他模型

### 问题：模型不可用
**解决方案**：
1. 查看 OpenRouter 状态页面
2. 检查模型 ID 是否正确
3. 尝试其他模型

## 📚 参考资源

- [OpenRouter 官网](https://openrouter.ai)
- [OpenRouter 文档](https://openrouter.ai/docs)
- [项目 API 文档](./API_DOCS.md)
- [系统架构](./ARCHITECTURE.md)

## 🚀 后续优化

- [ ] 请求队列管理
- [ ] 响应缓存
- [ ] 用户使用限额
- [ ] 模型性能分析
- [ ] 自动模型选择
- [ ] 成本优化

## ✅ 集成检查清单

- [x] OpenRouter API 配置
- [x] 10 个模型集成
- [x] 后端服务更新
- [x] 前端 UI 更新
- [x] 错误处理
- [x] API 端点更新
- [x] 文档完成

---

**集成完成！** 🎉

现在你可以使用 10 个强大的 OpenRouter 模型了。

立即启动应用体验多模型对比功能吧！🚀

