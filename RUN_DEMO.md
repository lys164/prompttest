# 🚀 快速演示指南

## 系统要求

- Node.js 18+
- npm 9+
- 现代浏览器

## 一键启动

### macOS / Linux

```bash
cd /tmp/interactive-drama-game

# 后台启动后端
cd backend && npm install && npm start > backend.log 2>&1 &
echo $! > backend.pid
sleep 3

# 启动前端
cd ../frontend && npm install && npm run dev
```

### Windows

```cmd
cd \tmp\interactive-drama-game

# 启动后端
cd backend
npm install
npm start

# 新开一个命令行窗口
cd \tmp\interactive-drama-game\frontend
npm install
npm run dev
```

## 手动启动

### 终端1：后端

```bash
cd /tmp/interactive-drama-game/backend
npm install
npm run build
npm start
```

应该看到：
```
✅ Backend server is running on http://localhost:3001
```

### 终端2：前端

```bash
cd /tmp/interactive-drama-game/frontend
npm install
npm run dev
```

应该看到：
```
▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

## 完整演示流程

### 1. 访问首页

打开浏览器：http://localhost:3000

你应该看到：
- 🎭 剧本大厅标题
- 分类筛选按钮（全部、单人×单AI、单人×多AI、多用户×多AI）
- 剧本卡片（显示"暗影特务"和"魔法学院"）

### 2. 尝试分类筛选

点击不同的分类按钮：
- ✅ **全部剧本**：显示所有剧本
- 👤 **单人×单AI**：只显示"魔法学院"
- 👥 **单人×多AI**：只显示"暗影特务"
- 👫 **多用户×多AI**：应该没有结果（可选）

### 3. 进入剧本详情

点击"暗影特务"卡片

你应该看到：
- ✅ 剧本标题、简介、背景故事
- ✅ 角色池（影子、指挥官）
- ✅ 右侧显示"需要 2 个AI角色"
- ✅ 三种游戏模式按钮

### 4. 开始游戏

点击"▶️ 正常游玩"按钮

弹出"🤖 选择AI角色"对话框：

#### 为"影子"选择AI角色
- 左侧显示："影子" - "一位身份成谜的神秘特工"
- 右侧显示推荐AI角色
- 点击"勇敢的探险家"（推荐）

你应该看到：
- ✅ "勇敢的探险家"卡片变蓝
- ✅ 下方出现"已选择：勇敢的探险家"提示

#### 为"指挥官"选择AI角色
- 左侧显示："指挥官" - "秘密行动的指挥官"
- 右侧显示推荐AI角色
- 点击"智慧的魔法师"（推荐）

### 5. 确认并开始游戏

- 点击"✅ 开始游戏"按钮
- 稍等几秒钟（创建会话中...）
- 跳转到游戏页面

### 6. 游戏页面

你应该看到：
- ✅ 故事背景和初始场景
- ✅ "你在旅馆房间里发现了一个隐藏的线索。你应该："
- ✅ 三个选择按钮：
  1. "立即调查线索"
  2. "先确保安全再调查"
  3. "请求支援团队协助"

### 7. 进行游戏

点击其中一个选择，例如"立即调查线索"

系统会：
- ✅ 调用AI模型生成故事
- ✅ 显示故事继续
- ✅ 显示两个角色的反应：
  - 勇敢的探险家的反应
  - 智慧的魔法师的反应
- ✅ 显示新的选择点和三个新选项

### 8. 继续游戏

重复选择，看故事如何根据你的选择而变化！

## 测试场景

### 场景1：多角色协作
- **推荐选择**：探险性选项
- **观察**：两个角色如何协调反应

### 场景2：冒险与谨慎
- **推荐选择**：激进 vs 保守选项
- **观察**：角色性格如何影响故事

### 场景3：团队合作
- **推荐选择**：请求支援选项
- **观察**：不同角色的协作方式

## API 测试

### 测试剧本API

```bash
# 获取所有剧本
curl http://localhost:3001/api/scripts | jq .

# 获取指定分类的剧本
curl "http://localhost:3001/api/scripts?category=【单人】【多AI】" | jq .

# 获取剧本详情
curl http://localhost:3001/api/scripts/script-001 | jq .

# 获取剧本角色
curl http://localhost:3001/api/scripts/script-001/characters | jq .
```

### 测试游戏API

```bash
# 获取用户AI角色
curl http://localhost:3001/api/game/user-characters/user-123 | jq .

# 获取推荐角色
curl "http://localhost:3001/api/game/recommend-characters/user-123?traits=冒险,好奇心强" | jq .
```

## 调试

### 后端日志

```bash
tail -f backend.log
```

### 前端控制台

打开浏览器开发者工具（F12）→ Console 标签

### 检查网络请求

打开浏览器开发者工具 → Network 标签

点击"正常游玩"并选择角色，观察API调用

## 常见问题

### ❓ 后端无法启动

**症状**：`EADDRINUSE: address already in use :::3001`

**解决**：
```bash
# 找到使用3001端口的进程
lsof -i :3001

# 杀死该进程
kill -9 <PID>

# 或改变端口
PORT=3002 npm start
```

### ❓ 前端连接不到后端

**症状**：网络请求失败

**检查**：
1. 后端是否在运行？`curl http://localhost:3001/health`
2. `.env.local` 中的 `NEXT_PUBLIC_API_URL` 是否正确？
3. 检查浏览器控制台是否有 CORS 错误

### ❓ 角色选择器不显示角色

**症状**：加载中状态一直不消失

**检查**：
1. `GET /api/game/user-characters/:userId` 是否返回数据？
2. 检查浏览器网络请求

### ❓ 游戏无法生成故事

**症状**：点击选择后没有反应

**检查**：
1. OpenRouter API Key 是否正确配置？
2. 检查后端日志是否有错误
3. OpenRouter 账户是否有余额？

## 高级演示

### 尝试不同的故事选择

进行同样的游戏但做出不同的选择，看故事如何分叉：
- **第一次**：选择"立即调查"
- **第二次**：选择"谨慎调查"
- **第三次**：选择"请求支援"

### 观察AI角色的性格

注意AI如何根据不同的角色性格做出不同的反应：
- 勇敢的探险家倾向于冒险
- 智慧的魔法师倾向于谨慎分析
- 忠诚的骑士倾向于保护和正义

### 尝试不同的角色组合

创建多个游戏会话，尝试不同的角色组合：
- 勇敢的探险家 + 智慧的魔法师
- 勇敢的探险家 + 忠诚的骑士
- 智慧的魔法师 + 忠诚的骑士

观察不同的性格组合如何影响故事的发展。

## 停止服务

### 停止后端

```bash
# 如果是后台运行
kill $(cat backend.pid)

# 或直接按 Ctrl+C
```

### 停止前端

在前端终端中按 **Ctrl+C**

## 下一步

✅ 演示完成后，你可以：

1. **集成Firebase**：存储真实的剧本和用户数据
2. **添加更多剧本**：设计更复杂的故事线
3. **优化UI**：美化游戏界面
4. **添加音效**：增强沉浸感
5. **多人游戏**：支持实时合作故事生成
6. **用户系统**：实现注册、登录、个人AI角色管理

祝你有个愉快的游戏体验！🎮✨

