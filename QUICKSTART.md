# 🚀 快速开始指南

## 5分钟快速启动

### 第1步：克隆/下载项目
```bash
cd interactive-drama-game
```

### 第2步：配置环境变量

#### 后端配置
```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env`，添加你的 OpenAI API Key：
```
OPENAI_API_KEY=sk-your-key-here
PORT=3001
NODE_ENV=development
```

> 📌 获取 OpenAI API Key：https://platform.openai.com/api-keys

#### 前端配置（可选）
```bash
cd ../frontend
# 默认已配置 API_URL=http://localhost:3001/api
```

### 第3步：启动应用

#### 方式1：使用启动脚本（推荐）
```bash
cd ..
chmod +x start.sh
./start.sh
```

#### 方式2：手动启动

**终端1 - 启动后端：**
```bash
cd backend
npm install
npm run dev
```

**终端2 - 启动前端：**
```bash
cd frontend
npm install
npm run dev
```

### 第4步：打开应用
浏览器访问：http://localhost:3000

## 🎮 开始游戏

1. **浏览剧本** - 首页显示所有可用剧本
2. **选择剧本** - 点击剧本卡片查看详情
3. **选择角色** - 选择一个或多个AI角色
4. **选择模式**：
   - 🎮 正常游玩
   - 🔧 调试模式（测试Prompt）
   - ⚖️ 对比模式（多模型对比）
5. **开始游戏** - 阅读故事并做出选择

## 🔧 开发者模式

### 调试模式
1. 进入游戏后，点击"打开开发者面板"
2. 输入你想测试的Prompt
3. 调整温度参数（0-1，越低越确定）
4. 点击"测试Prompt"查看结果

### 对比模式
1. 选择2个或多个模型
2. 输入Prompt
3. 点击"开始对比"
4. 查看各模型的响应和性能指标

## 📊 系统架构

```
用户浏览器 (Next.js)
    ↓
    ↓ HTTP/JSON
    ↓
Express 服务器
    ├─ 剧本管理
    ├─ 游戏会话
    └─ AI 集成
         ↓
         ↓ API 调用
         ↓
    OpenAI API
```

## 🐛 常见问题

### Q: 出现 "API Key 无效" 错误
**A:** 检查你的 OPENAI_API_KEY 是否正确，确保帐户有可用额度

### Q: 前端无法连接到后端
**A:** 确保后端运行在 http://localhost:3001 并检查 CORS 配置

### Q: Port 3000 或 3001 已被占用
**A:** 修改 package.json 中的 port 或杀死占用的进程
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Q: Node 模块安装失败
**A:** 清除缓存并重新安装
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 API 测试

### 测试后端健康状态
```bash
curl http://localhost:3001/health
```

### 获取所有剧本
```bash
curl http://localhost:3001/api/scripts
```

### 获取可用模型
```bash
curl http://localhost:3001/api/dev/models
```

## 🎨 自定义配置

### 修改主题色
编辑 `frontend/tailwind.config.ts` 的 colors 部分

### 添加新剧本
编辑 `backend/src/services/scriptService.ts` 的 `initializeSampleData()` 方法

### 更改 API 端口
后端：修改 `backend/.env` 的 PORT
前端：修改 `frontend/.env.local` 的 NEXT_PUBLIC_API_URL

## 📦 生产部署

### 使用 Docker
```bash
docker-compose up --build
```

### 手动部署
```bash
# 后端
cd backend
npm install
npm run build
PORT=3001 npm start

# 前端
cd frontend
npm install
npm run build
npm start
```

## 🆘 获取帮助

- 📖 查看完整文档：[README.md](./README.md)
- 🐛 报告问题：[GitHub Issues]
- 💬 讨论功能：[Discussions]

---

**祝你使用愉快！🎬✨**

