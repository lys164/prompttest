import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';

// 导入路由
import scriptRoutes from './routes/scripts';
import gameRoutes from './routes/game';
import devRoutes from './routes/dev';

// 加载环境变量 - 明确指定 .env 文件路径
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 WebSocket 服务器
export const wss = new WebSocket.Server({ server });

// 存储连接的客户端
const clients = new Map<string, WebSocket>();

// WebSocket 连接处理
wss.on('connection', (ws: WebSocket, req) => {
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
export function broadcastToSession(sessionId: string, data: any) {
    const client = clients.get(sessionId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        console.log(`📤 发送给 ${sessionId}:`, data.type);
    }
}

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/scripts', scriptRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/dev', devRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

