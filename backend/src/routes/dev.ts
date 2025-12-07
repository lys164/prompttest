import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../services/aiService';
import { DebugResponse } from '../types';

const router: Router = express.Router();

// 存储开发者调试会话
interface DebugSession {
    id: string;
    debugResponses: DebugResponse[];
    compareResults: any[];
}

const debugSessions: Map<string, DebugSession> = new Map();

/**
 * 调试模式：测试单个提示词
 * POST /api/dev/debug
 * Body: { prompt: string, model?: string, temperature?: number }
 */
router.post('/debug', async (req: Request, res: Response) => {
    const { prompt, model = 'gpt-4-turbo-preview', temperature = 0.7 } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required',
        });
    }

    try {
        const debugResponse = await aiService.debugPrompt(prompt, model, temperature);

        res.json({
            success: true,
            data: debugResponse,
        });
    } catch (error) {
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
router.post('/compare', async (req: Request, res: Response) => {
    const { prompt, models = ['gpt-4-turbo-preview', 'gpt-3.5-turbo'] } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required',
        });
    }

    try {
        const startTime = Date.now();
        const results = await aiService.compareModels(prompt, models);
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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 高级对比模式：支持多个独立配置的并行对比
 * POST /api/dev/compare-advanced
 * Body: { 
 *   sessions: Array<{
 *     id: string,
 *     model: string,
 *     systemPrompt: string,
 *     userPrompt: string,
 *     temperature?: number
 *   }>
 * }
 */
router.post('/compare-advanced', async (req: Request, res: Response) => {
    const { sessions } = req.body;

    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Sessions array is required',
        });
    }

    try {
        const startTime = Date.now();

        // 并行执行所有 session 的请求
        const results = await Promise.allSettled(
            sessions.map(async (session: any) => {
                const sessionStartTime = Date.now();
                try {
                    const response = await aiService.generateWithCustomPrompts(
                        session.systemPrompt || '',
                        session.userPrompt || '',
                        session.model || 'google/gemini-flash-1.5',
                        session.temperature || 0.7
                    );

                    return {
                        id: session.id,
                        model: session.model,
                        success: true,
                        response: response.content,
                        tokens: response.tokens,
                        generationTime: Date.now() - sessionStartTime,
                    };
                } catch (error) {
                    return {
                        id: session.id,
                        model: session.model,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        generationTime: Date.now() - sessionStartTime,
                    };
                }
            })
        );

        const processedResults = results.map((result) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    success: false,
                    error: result.reason?.message || 'Unknown error',
                };
            }
        });

        const totalTime = Date.now() - startTime;

        res.json({
            success: true,
            data: {
                results: processedResults,
                totalTime,
                timestamp: new Date(),
            },
        });
    } catch (error) {
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
router.post('/debug-session', (req: Request, res: Response) => {
    try {
        const sessionId = uuidv4();
        const session: DebugSession = {
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
    } catch (error) {
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
router.post('/debug-session/:sessionId/test', async (req: Request, res: Response) => {
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
            const debugResponse = await aiService.debugPrompt(prompt, model, temperature);
            session.debugResponses.push(debugResponse);
        } else if (mode === 'compare') {
            const models = req.body.models || ['gpt-4-turbo-preview', 'gpt-3.5-turbo'];
            const results = await aiService.compareModels(prompt, models);
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
    } catch (error) {
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
router.get('/debug-session/:sessionId', (req: Request, res: Response) => {
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
    } catch (error) {
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
router.get('/models', (req: Request, res: Response) => {
    const availableModels = [
    // 中国模型
    {
      id: 'deepseek/deepseek-chat-v3-0324',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      description: '最新深度学习模型',
      category: 'chinese',
    },
    {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'DeepSeek',
      description: '推理增强模型',
      category: 'chinese',
    },
    {
      id: 'qwen/qwen3-max',
      name: 'Qwen3 Max',
      provider: 'Alibaba',
      description: '通义千问最新旗舰模型',
      category: 'chinese',
    },
    {
      id: 'qwen/qwen-2.5-72b-instruct',
      name: 'Qwen 2.5 72B',
      provider: 'Alibaba',
      description: '通义千问大规模模型',
      category: 'chinese',
    },
    {
      id: 'z-ai/glm-4.6',
      name: 'GLM-4.6',
      provider: '智谱AI',
      description: '智谱最新旗舰模型',
      category: 'chinese',
    },
    {
      id: 'moonshotai/kimi-k2',
      name: 'Kimi K2',
      provider: 'Moonshot',
      description: 'Kimi 最新模型',
      category: 'chinese',
    },
    {
      id: 'moonshotai/moonshot-v1-128k',
      name: 'Moonshot V1 128K',
      provider: 'Moonshot (Kimi)',
      description: '长上下文模型',
      category: 'chinese',
    },
        // 推荐模型
        {
            id: 'google/gemini-flash-1.5',
            name: 'Gemini 1.5 Flash',
            provider: 'Google',
            description: '快速的多模态模型',
            category: 'recommended',
        },
        {
            id: 'google/gemini-pro-1.5',
            name: 'Gemini 1.5 Pro',
            provider: 'Google',
            description: '强大的多模态模型',
            category: 'recommended',
        },
        {
            id: 'anthropic/claude-3-haiku',
            name: 'Claude 3 Haiku',
            provider: 'Anthropic',
            description: '快速且经济的模型',
            category: 'recommended',
        },
        {
            id: 'anthropic/claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            description: '平衡性能与速度',
            category: 'recommended',
        },
        // 免费模型
        {
            id: 'meta-llama/llama-3.1-8b-instruct:free',
            name: 'Llama 3.1 8B',
            provider: 'Meta',
            description: '免费开源模型',
            category: 'free',
        },
        {
            id: 'google/gemma-2-9b-it:free',
            name: 'Gemma 2 9B',
            provider: 'Google',
            description: '免费轻量模型',
            category: 'free',
        },
        {
            id: 'mistralai/mistral-7b-instruct:free',
            name: 'Mistral 7B',
            provider: 'Mistral',
            description: '免费高效模型',
            category: 'free',
        },
        {
            id: 'qwen/qwen-2-7b-instruct:free',
            name: 'Qwen 2 7B',
            provider: 'Alibaba',
            description: '免费中文优化模型',
            category: 'free',
        },
        // 高级模型
        {
            id: 'openai/gpt-4-turbo',
            name: 'GPT-4 Turbo',
            provider: 'OpenAI',
            description: '强大的通用模型',
            category: 'premium',
        },
        {
            id: 'openai/gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            description: '最新多模态模型',
            category: 'premium',
        },
        {
            id: 'anthropic/claude-3-opus',
            name: 'Claude 3 Opus',
            provider: 'Anthropic',
            description: '最强推理能力',
            category: 'premium',
        },
    ];

    res.json({
        success: true,
        data: availableModels,
        total: availableModels.length,
    });
});

export default router;

