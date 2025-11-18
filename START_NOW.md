# 🚀 现在就可以启动！

## ✅ 当前状态

- ✅ 项目已复制到 `~/Downloads/interactive-drama-game`
- ✅ Firebase 凭证已放入：`serviceAccountKey.json`
- ✅ 后端已配置并就绪
- ✅ 前端已配置并就绪

## 🎮 启动应用（3 步）

### 方式1：使用两个终端（推荐）

**终端1 - 启动后端**：
```bash
cd ~/Downloads/interactive-drama-game/backend
npm start
```

**终端2 - 启动前端**：
```bash
cd ~/Downloads/interactive-drama-game/frontend
npm run dev
```

**打开浏览器**：
访问 http://localhost:3000

### 方式2：使用一个命令（后台运行）

```bash
# 在项目根目录运行
cd ~/Downloads/interactive-drama-game

# 启动后端（后台）
cd backend && npm start > /tmp/backend.log 2>&1 &

# 启动前端（后台）
cd ../frontend && npm run dev
```

## 📝 重要提醒

你已经放入了 `serviceAccountKey.json`，所以：

✅ 后端现在会自动使用你的 Firebase 凭证
✅ 可以读取 Firebase 中的真实剧本数据
✅ 如果 Firebase 连接失败，会自动回退到预置数据

## 🎯 现在可以体验

- 🎭 剧本大厅 - 查看所有可用剧本
- 📖 剧本详情 - 查看剧本信息和角色池
- 🤖 角色选择 - 选择 AI 角色参与游戏
- 🎮 游戏互动 - 与 AI 进行多角色对话
- 🔧 调试模式 - 测试 AI 提示词
- ⚖️ 对比模式 - 比较多个 AI 模型

## 📊 如果想查看 Firebase 数据

检查后端日志，看是否看到类似这样的消息：

```
✅ 从文件加载 Firebase 凭证: ../serviceAccountKey.json
🔐 使用服务账户凭证初始化 Firebase
📖 从 Firebase 读取 X 个剧本
```

## 🆘 如果有问题

1. **后端无法启动**
   ```bash
   # 检查端口是否被占用
   lsof -i :3001
   
   # 杀死占用进程
   kill -9 <PID>
   ```

2. **前端无法启动**
   ```bash
   # 检查 3000 端口
   lsof -i :3000
   ```

3. **查看日志**
   ```bash
   # 后端日志
   tail -f /tmp/backend.log
   
   # 或直接查看终端输出
   ```

## ✨ 准备好了吗？

```bash
cd ~/Downloads/interactive-drama-game
cd backend && npm start &
cd ../frontend && npm run dev
```

然后访问 http://localhost:3000 享受游戏！🎮
