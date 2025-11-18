# 🚀 快速启动指南（Downloads 版本）

## 📍 项目新位置

```
~/Downloads/interactive-drama-game
```

在 Finder 中打开下载文件夹即可看到！

## 🎯 一键启动

### 终端1 - 启动后端

```bash
cd ~/Downloads/interactive-drama-game/backend
npm start
```

### 终端2 - 启动前端

```bash
cd ~/Downloads/interactive-drama-game/frontend
npm run dev
```

### 打开浏览器

访问：**http://localhost:3000**

## 📝 关键下一步

### ⚠️ 重要：配置 Firebase 凭证

1. 访问 https://console.firebase.google.com
2. 选择项目 "billionare-501bf"
3. ⚙️ 设置 → 服务账户 → 生成新私钥
4. 将下载的 JSON 文件放到：

```
~/Downloads/interactive-drama-game/firebase-service-account.json
```

5. 重启后端，就能看到 Firebase 上的真实剧本了！

## 📂 项目结构

```
~/Downloads/interactive-drama-game/
├── backend/          ← Node.js API 服务器 (3001 端口)
│   ├── src/
│   └── dist/
├── frontend/         ← Next.js 应用 (3000 端口)
│   ├── app/
│   └── components/
└── 文档/
    ├── FIREBASE_CREDENTIALS_SETUP.md  ← Firebase 配置指南
    ├── README_ZH.md                   ← 项目概览
    └── 其他文档...
```

## 💡 有用的命令

```bash
# 进入项目
cd ~/Downloads/interactive-drama-game

# 进入后端
cd ~/Downloads/interactive-drama-game/backend

# 进入前端
cd ~/Downloads/interactive-drama-game/frontend

# 查看后端日志
tail -f /tmp/backend.log

# 测试 API
curl http://localhost:3001/api/scripts | jq '.data[] | {id, title}'
```

## ✨ 现在可以做什么

✅ 剧本大厅（显示 2 个预置剧本）
✅ 剧本详情页面
✅ AI 角色选择
✅ 多角色故事生成
✅ 三种游戏模式

🔥 **配置 Firebase 凭证后**，你将看到 Firebase 上的真实剧本！

---

需要帮助？查看项目中的其他文档或 FIREBASE_CREDENTIALS_SETUP.md！
