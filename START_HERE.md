# 🎬 从这里开始！

## ✅ 项目完成状态

所有核心功能已完成并可运行！

## 🚀 立即开始

### 方式 1：快速启动（推荐）

#### 终端 1 - 启动后端
```bash
cd /tmp/interactive-drama-game/backend
npm install  # 如果还没安装
npm start
```

等待看到：
```
✅ Backend server is running on http://localhost:3001
```

#### 终端 2 - 启动前端
```bash
cd /tmp/interactive-drama-game/frontend
npm install  # 如果还没安装
npm run dev
```

等待看到：
```
▲ Next.js 14.x.x
  - Local: http://localhost:3000
```

#### 打开浏览器
访问：**http://localhost:3000**

### 方式 2：使用一键启动脚本

```bash
cd /tmp/interactive-drama-game
bash start.sh  # 如果有的话
```

## 🎮 完整的游戏流程（5分钟）

### 步骤 1：进入剧本大厅
浏览器打开 http://localhost:3000 后，你会看到：
- 🎭 剧本大厅
- 分类筛选按钮
- 两个示例剧本

### 步骤 2：选择剧本
点击 **"暗影特务"** 卡片

你会看到：
- ✅ 剧本详情和背景故事
- ✅ 角色池（需要2个AI角色）
- ✅ 游戏模式选择

### 步骤 3：开始游戏
点击 **"▶️ 正常游玩"** 按钮

### 步骤 4：选择AI角色
一个对话框会弹出，显示：
- 剧本需要的角色："影子" 和 "指挥官"
- 可用的AI角色列表
- 推荐的AI角色（用绿色标记）

**为每个剧本角色选择一个AI角色**：
1. 为"影子"选择"勇敢的探险家"（推荐）
2. 为"指挥官"选择"智慧的魔法师"（推荐）

### 步骤 5：开始游戏
点击 **"✅ 开始游戏"** 按钮

系统会创建游戏会话并跳转到游戏页面

### 步骤 6：进行游戏
现在你会看到：
- 📖 故事背景
- 🎯 初始选择点
- 3️⃣ 三个可选择的行动

选择其中一个，例如 **"立即调查线索"**

### 步骤 7：查看AI生成的故事
AI 会生成：
- 📝 故事的下一段发展
- 💬 每个角色的独特反应
- 🎯 新的选择点

**继续重复步骤6-7** 直到故事完成！

## 📚 主要文档

| 文档 | 内容 | 何时阅读 |
|------|------|---------|
| 📖 [README_ZH.md](./README_ZH.md) | 项目概览和快速开始 | 初次接触 |
| 🔧 [SYSTEM_INTEGRATION.md](./SYSTEM_INTEGRATION.md) | 完整的技术架构和API文档 | 想了解技术实现 |
| 🎮 [RUN_DEMO.md](./RUN_DEMO.md) | 详细的演示步骤和API测试 | 想深入了解功能 |
| ✅ [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) | 项目完成情况总结 | 想了解项目状态 |

## 🎯 关键概念

### 剧本类别
- **【单人】【单AI】**：1个玩家 + 1个AI角色（如：魔法学院）
- **【单人】【多AI】**：1个玩家 + 多个AI角色（如：暗影特务）
- **【多人】【多AI】**：多个玩家 + 多个AI角色（开发中）

### 游戏模式
- **🎮 正常游玩**：完整游戏体验
- **🔧 调试模式**：测试AI提示词
- **⚖️ 对比模式**：比较多个AI模型

### AI 角色系统
每个 AI 角色有 15 个属性：
- 基本信息（姓名、身份、年龄等）
- 能力系统（超能力及等级）
- 性格特征（MBTI、星座等）
- 心理特征（恐惧、目标等）

## 🔌 API 速查

### 剧本 API
```bash
# 获取所有剧本
curl http://localhost:3001/api/scripts | jq .

# 按类别获取
curl "http://localhost:3001/api/scripts?category=【单人】【多AI】" | jq .

# 获取剧本详情
curl http://localhost:3001/api/scripts/script-001 | jq .
```

### 游戏 API
```bash
# 获取用户AI角色
curl http://localhost:3001/api/game/user-characters/user-123 | jq .

# 推荐AI角色
curl "http://localhost:3001/api/game/recommend-characters/user-123?traits=冒险,好奇心强" | jq .
```

## 💡 示例数据

### 示例剧本 1：暗影特务
- **类型**：【单人】【多AI】
- **需要**：2个AI角色
- **角色**：影子（特工）、指挥官（指挥中心）
- **时长**：60分钟

### 示例剧本 2：魔法学院
- **类型**：【单人】【单AI】
- **需要**：1个AI角色
- **角色**：梅林导师（魔法导师）
- **时长**：45分钟

### 示例AI角色
1. **勇敢的探险家** - ENFP，特长：冒险、解谜
2. **智慧的魔法师** - INTJ，特长：魔法、教学
3. **忠诚的骑士** - ISTJ，特长：战斗、保护

## 🐛 常见问题

### Q: 后端无法启动
**A**: 
```bash
# 检查3001端口是否被占用
lsof -i :3001

# 如果被占用，杀死进程
kill -9 <PID>

# 或改变端口
PORT=3002 npm start
```

### Q: 前端无法连接到后端
**A**: 
1. 确保后端运行中：`curl http://localhost:3001/health`
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL`
3. 查看浏览器控制台的 CORS 错误

### Q: 故事生成失败
**A**: 
1. 检查 OpenRouter API Key 是否正确配置
2. 查看后端日志中是否有错误信息
3. 确保 API 账户有足够余额

### Q: 如何测试API？
**A**: 
```bash
# 使用 cURL
curl http://localhost:3001/api/scripts | jq .

# 或使用 Postman
# 1. 导入 API 端点
# 2. 发送请求
# 3. 查看响应
```

## 🎓 学习路径

### 初级（5分钟）
- [ ] 启动应用
- [ ] 进行一次完整游戏

### 中级（15分钟）
- [ ] 尝试不同的角色组合
- [ ] 查看不同选择的效果
- [ ] 使用 API 测试工具

### 高级（30分钟）
- [ ] 阅读技术文档
- [ ] 查看代码实现
- [ ] 运行调试模式和对比模式

## 📊 项目结构速览

```
interactive-drama-game/
├── backend/           ← Node.js API 服务器 (端口3001)
│   ├── src/services/  ← 业务逻辑（脚本、AI、用户）
│   └── dist/          ← 编译输出
│
├── frontend/          ← Next.js 前端应用 (端口3000)
│   ├── app/           ← 页面
│   └── components/    ← UI 组件
│
└── docs/              ← 文档
    ├── README_ZH.md
    ├── SYSTEM_INTEGRATION.md
    ├── RUN_DEMO.md
    └── COMPLETION_SUMMARY.md
```

## ✨ 已完成的功能

✅ 多角色故事生成
✅ 角色推荐系统
✅ 三种游戏模式
✅ 完整的API接口
✅ 15个AI角色属性
✅ 详细的系统文档
✅ 示例剧本和角色
✅ 生产级别的代码质量

## 🚀 下一步改进

- [ ] Firebase 数据库集成
- [ ] 用户认证系统
- [ ] 用户创建自定义角色
- [ ] 多人实时游戏
- [ ] 成就和排行榜
- [ ] 更多剧本

## 📞 获取帮助

1. **查看文档**：阅读 `/docs/` 中的相关文档
2. **查看代码**：代码中有详细的注释
3. **测试API**：使用提供的 API 测试示例
4. **查看日志**：检查终端或浏览器控制台的输出

## 🎉 准备好了吗？

```bash
# 一键启动
cd /tmp/interactive-drama-game/backend && npm start &
cd /tmp/interactive-drama-game/frontend && npm run dev
```

然后打开 **http://localhost:3000** 开始游戏！

---

**祝你享受这个 AI 驱动的互动故事游戏！** 🎭✨

如有任何问题，请查看相关文档或检查代码注释。
