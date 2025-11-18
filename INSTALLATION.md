# 🔧 完整安装指南

## 前置条件

在开始之前，请确保你的系统中已安装以下软件：

### 必需
- **Node.js** ≥ 18.0.0 - [下载](https://nodejs.org/)
- **npm** ≥ 9.0.0 （通常与 Node.js 一起安装）

### 可选
- **Git** - 用于版本控制
- **Docker** - 用于容器化部署

### 外部服务
- **OpenAI API Key** - 用于 AI 功能 [申请](https://platform.openai.com/api-keys)

---

## 检查安装

```bash
# 检查 Node.js 版本
node --version
# 应输出 v18.0.0 或更高

# 检查 npm 版本
npm --version
# 应输出 9.0.0 或更高
```

---

## 第一步：获取项目

### 方式1：Git克隆
```bash
git clone https://github.com/your-repo/interactive-drama-game.git
cd interactive-drama-game
```

### 方式2：下载ZIP
1. 访问项目仓库
2. 点击 "Code" → "Download ZIP"
3. 解压文件
4. 进入项目目录

---

## 第二步：配置后端

### 2.1 进入后端目录
```bash
cd backend
```

### 2.2 安装依赖
```bash
npm install
```

### 2.3 配置环境变量
```bash
# 复制示例文件
cp .env.example .env

# 使用编辑器打开 .env
# macOS/Linux
nano .env

# Windows
notepad .env
```

### 2.4 编辑 .env 文件

找到这一行：
```
OPENAI_API_KEY=sk-your-api-key-here
```

替换为你的真实 API Key：
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

> 📌 如何获取 OpenAI API Key？
> 1. 访问 https://platform.openai.com/api-keys
> 2. 登录或创建账户
> 3. 点击 "Create new secret key"
> 4. 复制生成的 key（只显示一次）

### 2.5 验证配置

```bash
# 返回到项目根目录
cd ..

# 测试后端连接
curl http://localhost:3001/health 2>/dev/null || echo "后端未运行"
```

---

## 第三步：配置前端

### 3.1 进入前端目录
```bash
cd frontend
```

### 3.2 安装依赖
```bash
npm install
```

### 3.3 配置环境变量（可选）

```bash
# 复制示例文件
cp .env.example .env.local
```

> ⚠️ 注意：前端已有默认 API URL (`http://localhost:3001/api`)，通常不需要修改

---

## 第四步：启动应用

### 方式1：使用启动脚本（推荐）

#### macOS/Linux
```bash
# 返回项目根目录
cd ..

# 给脚本添加执行权限
chmod +x start.sh

# 运行脚本
./start.sh

# 等待输出：
# 🚀 启动后端服务器...
# ✅ 后端启动中 (PID: 12345)
# 🎨 启动前端应用...
# ✅ 前端启动中 (PID: 12346)
```

#### Windows
```bash
# 需要分别启动后端和前端（见方式2）
```

### 方式2：手动启动

#### 启动后端

打开 **终端1**：
```bash
cd backend
npm run dev

# 预期输出：
# 🚀 Server is running at http://localhost:3001
# 📝 API documentation: http://localhost:3001/api/docs
```

#### 启动前端

打开 **终端2**：
```bash
cd frontend
npm run dev

# 预期输出：
#   ▲ Next.js 14.0.3
#   - Local:        http://localhost:3000
```

### 方式3：使用 Docker

```bash
# 确保 Docker 已安装
docker --version

# 在项目根目录运行
docker-compose up --build

# 稍候几秒钟，容器启动完成后访问
# http://localhost:3000
```

---

## 第五步：打开应用

1. 打开浏览器
2. 访问 **http://localhost:3000**

你应该看到应用首页，显示所有可用的剧本。

---

## ✅ 验证安装

### 检查清单

- [ ] 后端运行在 `http://localhost:3001`
- [ ] 前端运行在 `http://localhost:3000`
- [ ] 可以看到剧本列表
- [ ] 点击剧本可以进入详情页
- [ ] 可以选择角色并开始游戏
- [ ] AI 能生成响应内容

### 测试 API

```bash
# 在新终端中测试

# 获取剧本列表
curl http://localhost:3001/api/scripts

# 获取可用模型
curl http://localhost:3001/api/dev/models

# 测试后端健康状态
curl http://localhost:3001/health
```

---

## 🐛 常见安装问题

### Q1: "node: command not found"
**原因**: Node.js 未安装或不在系统 PATH 中

**解决方案**:
- 下载并安装 Node.js: https://nodejs.org/
- 重启终端
- 验证: `node --version`

### Q2: "Permission denied" (start.sh)
**原因**: start.sh 文件没有执行权限

**解决方案**:
```bash
chmod +x start.sh
./start.sh
```

### Q3: "Port 3000 already in use"
**原因**: 端口 3000 已被其他应用占用

**解决方案**:
```bash
# macOS/Linux - 找出占用进程
lsof -i :3000

# 杀死进程（替换 PID）
kill -9 <PID>

# Windows - 在命令提示符中
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Q4: "OPENAI_API_KEY is undefined"
**原因**: 后端 .env 文件未配置 API Key

**解决方案**:
1. 打开 `backend/.env`
2. 检查 `OPENAI_API_KEY` 是否已设置
3. 确保使用了有效的 API Key
4. 重启后端服务

### Q5: "Cannot GET /api/scripts"
**原因**: 后端未运行或 API 地址错误

**解决方案**:
1. 确保后端正在运行: `npm run dev` 在 backend 目录
2. 检查 .env 文件中的 PORT 配置
3. 查看是否有错误日志

### Q6: "CORS error"
**原因**: 跨域资源共享配置错误

**解决方案**:
1. 确保后端正确启用 CORS
2. 检查前端的 API URL: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
3. 确保两个服务都在运行

### Q7: npm install 失败
**原因**: 网络问题或依赖冲突

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果仍然失败，尝试使用淘宝镜像（中国用户）
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install
```

---

## 📚 后续步骤

安装完成后：

1. **查看文档**
   - [README.md](./README.md) - 功能概述
   - [QUICKSTART.md](./QUICKSTART.md) - 快速开始
   - [API_DOCS.md](./API_DOCS.md) - API 文档

2. **开始游戏**
   - 访问 http://localhost:3000
   - 浏览剧本
   - 选择角色开始游戏

3. **测试开发者工具**
   - 选择"调试模式"来测试 Prompt
   - 选择"对比模式"来比较模型

4. **自定义配置**
   - 添加新剧本
   - 修改 UI 主题
   - 集成更多 AI 模型

---

## 🚀 生产环境部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start "npm start" --name drama-backend

# 启动前端
cd ../frontend
npm run build
pm2 start "npm start" --name drama-frontend

# 查看状态
pm2 status

# 查看日志
pm2 logs drama-backend
pm2 logs drama-frontend
```

### 使用 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/drama-game

upstream backend {
    server 127.0.0.1:3001;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

---

## 📞 获取帮助

如果遇到问题：

1. 查看[常见问题](#-常见安装问题)
2. 查看项目文档
3. 检查控制台错误日志
4. 提交 Issue：[GitHub Issues]

---

## ✨ 完成！

恭喜! 你已经成功安装了 AI 互动影视游戏！

现在可以：
- 🎮 开始游戏体验
- 🔧 使用开发者工具
- ⚙️ 自定义和扩展应用

**祝你使用愉快！** 🎬✨

