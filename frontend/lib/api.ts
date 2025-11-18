import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 增加超时时间到 60 秒
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===== 剧本相关 API =====
export const scriptApi = {
    /**
     * 获取所有剧本
     */
    getAllScripts: async (category?: string) => {
        const response = await api.get('/scripts', {
            params: category ? { category } : undefined,
        });
        return response.data;
    },

    /**
     * 获取剧本详情
     */
    getScriptDetail: async (scriptId: string) => {
        const response = await api.get(`/scripts/${scriptId}`);
        return response.data;
    },

    /**
     * 获取剧本的角色
     */
    getScriptCharacters: async (scriptId: string) => {
        const response = await api.get(`/scripts/${scriptId}/characters`);
        return response.data;
    },

    /**
     * 获取初始场景
     */
    getInitialScene: async (scriptId: string) => {
        const response = await api.get(`/scripts/${scriptId}/initial-scene`);
        return response.data;
    },
};

// ===== 游戏会话相关 API =====
export const gameApi = {
    /**
     * 获取用户的AI角色
     */
    getUserAICharacters: async (userId: string) => {
        const response = await api.get(`/game/user-characters/${userId}`);
        return response.data;
    },

    /**
     * 获取推荐的AI角色
     */
    getRecommendedCharacters: async (userId: string, traits: string[]) => {
        const response = await api.get(`/game/recommend-characters/${userId}`, {
            params: { traits: traits.join(',') },
        });
        return response.data;
    },

    /**
     * 创建新游戏会话
     */
    createSession: async (
        scriptId: string,
        userId: string,
        characterMappings: Array<{
            userAICharacterId: string;
            scriptRoleId: string;
            scriptCharacterName: string;
            userAICharacterName: string;
        }>,
        mode: string = 'normal'
    ) => {
        const response = await api.post('/game/sessions', {
            scriptId,
            userId,
            characterMappings,
            mode,
        });
        return response.data;
    },

    /**
     * 获取游戏会话
     */
    getSession: async (sessionId: string) => {
        const response = await api.get(`/game/sessions/${sessionId}`);
        return response.data;
    },

    /**
     * 提交选择
     */
    submitChoice: async (
        sessionId: string,
        choiceDataOrId: string | { choiceId: string; userInput?: string; systemPromptOverride?: string; selectedModel?: string },
        userInput?: string
    ) => {
        let requestBody: any;

        // 支持两种调用方式：旧方式和新方式
        if (typeof choiceDataOrId === 'string') {
            // 旧方式：submitChoice(sessionId, choiceId, userInput)
            requestBody = {
                choiceId: choiceDataOrId,
                userInput,
            };
        } else {
            // 新方式：submitChoice(sessionId, { choiceId, userInput, systemPromptOverride, selectedModel })
            requestBody = choiceDataOrId;
        }

        const response = await api.post(`/game/sessions/${sessionId}/choose`, requestBody);
        return response.data;
    },

    /**
     * 获取对话历史
     */
    getDialogueHistory: async (sessionId: string) => {
        const response = await api.get(`/game/sessions/${sessionId}/history`);
        return response.data;
    },

    /**
     * 获取系统提示模板
     */
    getSystemPrompt: async (sessionId: string, scriptId?: string) => {
        const params = scriptId ? { scriptId } : undefined;
        const response = await api.get(`/game/sessions/${sessionId}/system-prompt`, { params });
        return response.data;
    },
};

// ===== 开发者模式相关 API =====
export const devApi = {
    /**
     * 调试提示词
     */
    debugPrompt: async (prompt: string, model?: string, temperature?: number) => {
        const response = await api.post('/dev/debug', {
            prompt,
            model,
            temperature,
        });
        return response.data;
    },

    /**
     * 对比多个模型
     */
    compareModels: async (prompt: string, models?: string[]) => {
        const response = await api.post('/dev/compare', {
            prompt,
            models,
        });
        return response.data;
    },

    /**
     * 创建调试会话
     */
    createDebugSession: async () => {
        const response = await api.post('/dev/debug-session');
        return response.data;
    },

    /**
     * 向调试会话添加测试
     */
    addDebugTest: async (sessionId: string, prompt: string, model?: string, temperature?: number, mode?: string) => {
        const response = await api.post(`/dev/debug-session/${sessionId}/test`, {
            prompt,
            model,
            temperature,
            mode,
        });
        return response.data;
    },

    /**
     * 获取调试会话结果
     */
    getDebugSession: async (sessionId: string) => {
        const response = await api.get(`/dev/debug-session/${sessionId}`);
        return response.data;
    },

    /**
     * 获取可用模型列表
     */
    getAvailableModels: async () => {
        const response = await api.get('/dev/models');
        return response.data;
    },
};

export default api;

