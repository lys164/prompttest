# 🔐 Firebase 凭证配置指南

## 问题诊断

后端收到错误：
```
Error: Could not load the default credentials
```

这说明 Firebase Admin SDK 无法找到认证凭证。

## ✅ 解决方案（最简单）

### 步骤1：下载 Firebase 服务账户密钥

1. 访问 https://console.firebase.google.com
2. 选择项目 "billionare-501bf"
3. 点击左侧齿轮 ⚙️ → 选择"服务账户"
4. 点击"生成新私钥"按钮
5. 保存下载的 JSON 文件

### 步骤2：放置文件到项目

```bash
# 将下载的文件复制到项目目录
cp ~/Downloads/billionare-501bf-*.json /tmp/interactive-drama-game/firebase-service-account.json
```

### 步骤3：重启后端

```bash
# 杀死旧进程
pkill -f "node dist/index.js"

# 重新启动
cd /tmp/interactive-drama-game/backend
npm start
```

### 步骤4：查看日志

如果看到以下日志，说明配置成功：

```
✅ 从文件加载 Firebase 凭证
🔐 使用服务账户凭证初始化 Firebase
📖 从 Firebase 读取 X 个剧本
```

## 🎉 验证成功

```bash
# 应该看到 Firebase 中的真实剧本
curl http://localhost:3001/api/scripts | jq '.data[0] | {id, 剧本类别}'
```

如果成功，将显示 Firebase 中的实际剧本数据，而不是预置数据！

## 🆘 如果还是不行

检查以下几点：

1. **文件路径是否正确**
   ```bash
   ls -la /tmp/interactive-drama-game/firebase-service-account.json
   ```

2. **后端日志中是否有错误**
   ```bash
   tail -50 /tmp/backend.log
   ```

3. **Firebase 中是否有 livestory-story 集合**
   - 访问 Firebase 控制台
   - 检查 Firestore 数据库
   - 确保有 `livestory-story` 集合和数据

4. **服务账户权限是否足够**
   - 返回 Firebase 控制台
   - 检查"Firestore 规则"是否允许读取
