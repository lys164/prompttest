"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const aiService_1 = require("../services/aiService");
const router = express_1.default.Router();
const debugSessions = new Map();
/**
 * 调试模式：测试单个提示词
 * POST /api/dev/debug
 * Body: { prompt: string, model?: string, temperature?: number }
 */
router.post('/debug', async (req, res) => {
    const { prompt, model = 'gpt-4-turbo-preview', temperature = 0.7 } = req.body;
    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required',
        });
    }
    try {
        const debugResponse = await aiService_1.aiService.debugPrompt(prompt, model, temperature);
        res.json({
            success: true,
            data: debugResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * 对比模式：同时测试多个模型
 * POST /api/dev/compare
 * Body: { prompt: string, models?: string[] }
 */
router.post('/compare', async (req, res) => {
    const { prompt, models = ['gpt-4-turbo-preview', 'gpt-3.5-turbo'] } = req.body;
    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required',
        });
    }
    try {
        const startTime = Date.now();
        const results = await aiService_1.aiService.compareModels(prompt, models);
        const totalTime = Date.now() - startTime;
        res.json({
            success: true,
            data: {
                prompt,
                results,
                totalTime,
                timestamp: new Date(),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * 创建一个调试会话
 * POST /api/dev/debug-session
 */
router.post('/debug-session', (req, res) => {
    try {
        const sessionId = (0, uuid_1.v4)();
        const session = {
            id: sessionId,
            debugResponses: [],
            compareResults: [],
        };
        debugSessions.set(sessionId, session);
        res.status(201).json({
            success: true,
            data: {
                sessionId,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * 向调试会话添加测试
 * POST /api/dev/debug-session/:sessionId/test
 */
router.post('/debug-session/:sessionId/test', async (req, res) => {
    const { sessionId } = req.params;
    const { prompt, model = 'gpt-4-turbo-preview', temperature = 0.7, mode = 'single' } = req.body;
    try {
        const session = debugSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Debug session not found',
            });
        }
        if (mode === 'single') {
            const debugResponse = await aiService_1.aiService.debugPrompt(prompt, model, temperature);
            session.debugResponses.push(debugResponse);
        }
        else if (mode === 'compare') {
            const models = req.body.models || ['gpt-4-turbo-preview', 'gpt-3.5-turbo'];
            const results = await aiService_1.aiService.compareModels(prompt, models);
            session.compareResults.push({
                prompt,
                results,
                timestamp: new Date(),
            });
        }
        debugSessions.set(sessionId, session);
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * 获取调试会话的结果
 * GET /api/dev/debug-session/:sessionId
 */
router.get('/debug-session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = debugSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Debug session not found',
            });
        }
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * 获取可用的模型列表
 * GET /api/dev/models
 */
router.get('/models', (req, res) => {
    const availableModels = [
        // OpenRouter 模型
        {
            id: 'openai/gpt-5.1-chat',
            name: 'GPT-5.1',
            provider: 'OpenRouter (OpenAI)',
            description: '最新的通用大型语言模型',
            category: 'openrouter',
        },
        {
            id: 'anthropic/claude-haiku-4.5',
            name: 'Claude 4.5 Haiku',
            provider: 'OpenRouter (Anthropic)',
            description: '小型但强大的推理模型',
            category: 'openrouter',
        },
        {
            id: 'google/gemini-2.5-flash-preview-09-2025',
            name: 'Gemini 2.5 Flash',
            provider: 'OpenRouter (Google)',
            description: '快速的多模态模型',
            category: 'openrouter',
        },
        {
            id: 'x-ai/grok-4-fast',
            name: 'Grok 4 Fast',
            provider: 'OpenRouter (X AI)',
            description: '快速推理的模型',
            category: 'openrouter',
        },
        {
            id: 'qwen/qwen3-next-80b-a3b-instruct',
            name: 'Qwen3 Next 80B',
            provider: 'OpenRouter (Alibaba)',
            description: '阿里大规模语言模型',
            category: 'openrouter',
        },
        {
            id: 'meituan/longcat-flash-chat:free',
            name: 'LongCat Flash Chat',
            provider: 'OpenRouter (Meituan)',
            description: '长上下文处理能力',
            category: 'openrouter',
        },
        {
            id: 'deepseek/deepseek-chat-v3.1:free',
            name: 'DeepSeek V3.1',
            provider: 'OpenRouter (DeepSeek)',
            description: '深度学习优化的模型',
            category: 'openrouter',
        },
        {
            id: 'moonshotai/kimi-k2:free',
            name: 'Kimi K2',
            provider: 'OpenRouter (Moonshot)',
            description: '中文优化的大型模型',
            category: 'openrouter',
        },
        {
            id: 'thedrummer/anubis-70b-v1.1',
            name: 'Anubis 70B V1.1',
            provider: 'OpenRouter (Drummer)',
            description: '专业优化的70B模型',
            category: 'openrouter',
        },
        {
            id: 'thedrummer/skyfall-36b-v2',
            name: 'Skyfall 36B V2',
            provider: 'OpenRouter (Drummer)',
            description: '平衡性能与效率的模型',
            category: 'openrouter',
        },
        // OpenAI 模型（备用）
        {
            id: 'gpt-4',
            name: 'GPT-4',
            provider: 'OpenAI',
            description: '强大的通用模型',
            category: 'openai',
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            provider: 'OpenAI',
            description: '快速且成本效益高',
            category: 'openai',
        },
    ];
    res.json({
        success: true,
        data: availableModels,
        total: availableModels.length,
    });
});
exports.default = router;
