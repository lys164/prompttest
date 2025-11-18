"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
exports.broadcastToSession = broadcastToSession;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
// 导入路由
const scripts_1 = __importDefault(require("./routes/scripts"));
const game_1 = __importDefault(require("./routes/game"));
const dev_1 = __importDefault(require("./routes/dev"));
// 加载环境变量 - 明确指定 .env 文件路径
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 创建 HTTP 服务器
const server = http_1.default.createServer(app);
// 创建 WebSocket 服务器
exports.wss = new ws_1.default.Server({ server });
// 存储连接的客户端
const clients = new Map();
// WebSocket 连接处理
exports.wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        ws.close(1008, 'Missing sessionId');
        return;
    }
    console.log(`🔗 WebSocket 连接: ${sessionId}`);
    clients.set(sessionId, ws);
    ws.on('close', () => {
        console.log(`🔌 WebSocket 断开: ${sessionId}`);
        clients.delete(sessionId);
    });
    ws.on('error', (error) => {
        console.error(`⚠️ WebSocket 错误 (${sessionId}):`, error);
    });
});
// 导出广播函数
function broadcastToSession(sessionId, data) {
    const client = clients.get(sessionId);
    if (client && client.readyState === ws_1.default.OPEN) {
        client.send(JSON.stringify(data));
        console.log(`📤 发送给 ${sessionId}:`, data.type);
    }
}
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 路由
app.use('/api/scripts', scripts_1.default);
app.use('/api/game', game_1.default);
app.use('/api/dev', dev_1.default);
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});
// 启动服务器
server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready at ws://localhost:${PORT}`);
    console.log(`📝 API documentation: http://localhost:${PORT}/api/docs`);
});
