// WebSocket 客户端管理

class WebSocketClient {
    private ws: WebSocket | null = null;
    private sessionId: string | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    /**
     * 连接到 WebSocket 服务器
     */
    connect(sessionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = `${this.getWebSocketUrl()}?sessionId=${encodeURIComponent(sessionId)}`;
                console.log(`🔗 WebSocket 连接中: ${wsUrl}`);

                this.sessionId = sessionId;
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log(`✅ WebSocket 连接成功`);
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log(`📨 收到 WebSocket 消息:`, message.type);

                        // 调用对应的消息处理器
                        const handler = this.messageHandlers.get(message.type);
                        if (handler) {
                            handler(message);
                        }
                    } catch (error) {
                        console.error(`⚠️ WebSocket 消息解析错误:`, error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error(`❌ WebSocket 错误:`, error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log(`🔌 WebSocket 连接已关闭`);
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error(`❌ WebSocket 连接失败:`, error);
                reject(error);
            }
        });
    }

    /**
     * 尝试重新连接
     */
    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
            this.reconnectAttempts++;
            console.log(`🔄 尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect(this.sessionId!).catch(console.error);
            }, this.reconnectDelay);
        }
    }

    /**
     * 注册消息处理器
     */
    on(messageType: string, handler: (data: any) => void) {
        this.messageHandlers.set(messageType, handler);
        console.log(`📌 注册 WebSocket 消息处理器: ${messageType}`);
    }

    /**
     * 移除消息处理器
     */
    off(messageType: string) {
        this.messageHandlers.delete(messageType);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.sessionId = null;
        this.messageHandlers.clear();
    }

    /**
     * 获取 WebSocket URL
     */
    private getWebSocketUrl(): string {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // 将 http:// 或 https:// 转换为 ws:// 或 wss://
        // 移除末尾的 /api 路径
        let wsUrl = apiUrl
            .replace(/\/api\/?$/, '')  // 移除末尾的 /api
            .replace('http://', 'ws://')
            .replace('https://', 'wss://');
        
        return wsUrl;
    }

    /**
     * 检查连接状态
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// 导出单例
export const wsClient = new WebSocketClient();

