'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gameApi, devApi } from '@/lib/api';

interface CompareModeProps {
    sessionId: string;
    script: any;
    characters: any[];
    session: any;
    onSessionUpdate: (session: any) => void;
}

interface SessionConfig {
    id: number;
    name: string;
    model: string;
    systemPrompt: string;
    response: string | null;
    loading: boolean;
    error: string | null;
    generationTime: number | null;
    color: string;
}

const DEFAULT_MODELS = [
    'deepseek/deepseek-chat-v3-0324',
    'qwen/qwen-2.5-72b-instruct',
    'google/gemini-flash-1.5',
];

const MODEL_OPTIONS = [
    {
        group: '🇨🇳 中国模型', options: [
            { value: 'doubao-seed-1-6-251015', label: '豆包 1.6 (字节)' },
            { value: 'deepseek/deepseek-v3.2', label: 'DeepSeek V3.2' },
            { value: 'deepseek/deepseek-chat-v3.1', label: 'DeepSeek V3.1' },
            { value: 'qwen/qwen3-max', label: 'Qwen3 Max' },
            { value: 'qwen/qwen3-coder-plus', label: 'Qwen3 Coder Plus' },
            { value: 'z-ai/glm-4.6', label: 'GLM-4.6 (智谱)' },
            { value: 'z-ai/glm-4.5v', label: 'GLM-4.5V (智谱)' },
            { value: 'moonshotai/kimi-k2-0905', label: 'Kimi K2' },
            { value: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 Thinking' },
        ]
    },
    {
        group: '🔥 推荐模型', options: [
            { value: 'google/gemini-flash-1.5', label: 'Gemini 1.5 Flash' },
            { value: 'google/gemini-pro-1.5', label: 'Gemini 1.5 Pro' },
            { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
            { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        ]
    },
    {
        group: '🚀 免费模型', options: [
            { value: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (免费)' },
            { value: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B (免费)' },
            { value: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (免费)' },
            { value: 'qwen/qwen-2-7b-instruct:free', label: 'Qwen 2 7B (免费)' },
        ]
    },
    {
        group: '💎 高级模型', options: [
            { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' },
            { value: 'openai/gpt-4o', label: 'GPT-4o' },
            { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
        ]
    },
];

export default function CompareMode({
    sessionId,
    script,
    characters,
    session,
    onSessionUpdate,
}: CompareModeProps) {
    const [userCharacterInfo, setUserCharacterInfo] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [defaultSystemPrompt, setDefaultSystemPrompt] = useState('');

    // 3个session的配置
    const [sessions, setSessions] = useState<SessionConfig[]>([
        { id: 1, name: 'Session A', model: DEFAULT_MODELS[0], systemPrompt: '', response: null, loading: false, error: null, generationTime: null, color: 'blue' },
        { id: 2, name: 'Session B', model: DEFAULT_MODELS[1], systemPrompt: '', response: null, loading: false, error: null, generationTime: null, color: 'purple' },
        { id: 3, name: 'Session C', model: DEFAULT_MODELS[2], systemPrompt: '', response: null, loading: false, error: null, generationTime: null, color: 'green' },
    ]);

    // 是否使用统一的 system prompt
    const [useUnifiedPrompt, setUseUnifiedPrompt] = useState(true);
    const [unifiedPrompt, setUnifiedPrompt] = useState('');

    useEffect(() => {
        initializeCompareMode();
    }, [sessionId, session]);

    const initializeCompareMode = async () => {
        console.log('🔧 CompareMode 初始化开始');

        // 检查是否有用户角色信息
        if (session?.userCharacterInfo) {
            console.log('✅ 找到 userCharacterInfo:', session.userCharacterInfo.scriptCharacterName);
            setUserCharacterInfo(session.userCharacterInfo);
        } else {
            console.log('⚠️ 没有 userCharacterInfo');
        }

        // 确保初始状态不是已开始
        setGameStarted(false);

        // 获取默认的 system prompt
        try {
            const promptRes = await gameApi.getSystemPrompt(sessionId);
            if (promptRes?.data?.systemPrompt) {
                setDefaultSystemPrompt(promptRes.data.systemPrompt);
                setUnifiedPrompt(promptRes.data.systemPrompt);
                console.log('✅ 获取到默认 system prompt');
            }
        } catch (error) {
            console.warn('Failed to get default system prompt:', error);
        }

        // 标记初始化完成
        setIsInitialized(true);
        console.log('✅ CompareMode 初始化完成');
    };

    // 更新单个session的配置
    const updateSession = (sessionId: number, updates: Partial<SessionConfig>) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, ...updates } : s
        ));
    };

    // 替换角色变量
    const replaceCharacterVariables = (text: string): string => {
        if (!text || !session?.characterMappings) return text;

        let result = text;
        const characterMappings = session.characterMappings;
        const characterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        characterMappings.forEach((mapping: any, index: number) => {
            const characterName = mapping.userAICharacterName || mapping.scriptCharacterName || `角色${index + 1}`;

            if (mapping.scriptRoleId) {
                const placeholderRegex = new RegExp(`{{${mapping.scriptRoleId}}}`, 'g');
                result = result.replace(placeholderRegex, characterName);
            }

            const numericRegex = new RegExp(`{{角色${index}}}`, 'g');
            result = result.replace(numericRegex, characterName);
        });

        characterLabels.forEach((label, index) => {
            if (index < characterMappings.length) {
                const mapping = characterMappings[index];
                const characterName = mapping.userAICharacterName || mapping.scriptCharacterName || `角色${label}`;
                const regex = new RegExp(`{{角色${label}}}`, 'g');
                result = result.replace(regex, characterName);
            }
        });

        return result;
    };

    // 选中策略选项
    const handleOptionSelect = (option: any) => {
        setSelectedOption(option);
    };

    // 自定义输入确认
    const handleCustomConfirm = async () => {
        const option = { id: 'custom', 文本: customUserInput };
        setSelectedOption(option);
        await runComparison(option.文本);
    };

    // 确认选择，同时运行3个session
    const handleConfirmSelection = async () => {
        if (!selectedOption) return;
        await runComparison(selectedOption.文本);
    };

    // 执行对比
    const runComparison = async (userInput: string) => {
        setGameStarted(true);

        // 设置所有 session 为加载状态
        sessions.forEach(s => {
            updateSession(s.id, { loading: true, error: null, response: null, generationTime: null });
        });

        try {
            // 构建用户提示
            const userPrompt = `用户选择了：${userInput}\n\n请根据这个选择生成故事的下一步发展。`;

            // 使用高级对比 API 并行调用所有模型
            const compareResponse = await devApi.compareAdvanced(
                sessions.map(s => ({
                    id: String(s.id),
                    model: s.model,
                    systemPrompt: useUnifiedPrompt ? unifiedPrompt : (s.systemPrompt || defaultSystemPrompt),
                    userPrompt: userPrompt,
                    temperature: 0.7,
                }))
            );

            // 处理响应
            if (compareResponse?.success && compareResponse?.data?.results) {
                compareResponse.data.results.forEach((result: any) => {
                    const sessionId = parseInt(result.id);
                    if (result.success) {
                        updateSession(sessionId, {
                            response: result.response,
                            loading: false,
                            generationTime: result.generationTime,
                        });
                    } else {
                        updateSession(sessionId, {
                            error: result.error || '生成失败',
                            loading: false,
                            generationTime: result.generationTime,
                        });
                    }
                });
            } else {
                // 如果整体请求失败，所有 session 都标记为错误
                sessions.forEach(s => {
                    updateSession(s.id, {
                        error: '请求失败',
                        loading: false,
                    });
                });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '生成失败';
            sessions.forEach(s => {
                updateSession(s.id, {
                    error: errorMsg,
                    loading: false,
                });
            });
        }
    };

    // 重置对比
    const handleReset = () => {
        setGameStarted(false);
        setSelectedOption(null);
        setSessions(prev => prev.map(s => ({
            ...s,
            response: null,
            loading: false,
            error: null,
            generationTime: null,
        })));
    };

    // 复制默认 prompt 到统一 prompt
    const copyDefaultPrompt = () => {
        setUnifiedPrompt(defaultSystemPrompt);
    };

    // 用户自定义输入（当没有预置策略时）
    const [customUserInput, setCustomUserInput] = useState('');

    // 加载中状态
    if (!isInitialized) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-gray-700 border-t-orange-500 rounded-full mb-4"
                    />
                    <p className="text-gray-400">正在加载对比模式配置...</p>
                </div>
            </div>
        );
    }

    // 初始化界面：配置模型和 System Prompt
    if (!gameStarted) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                >
                    {/* 标题 */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                            ⚖️ 模型对比模式
                        </h1>
                        <p className="text-gray-400">同时运行3个session，对比不同模型的效果</p>
                    </div>

                    {/* 3个Session配置 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {sessions.map((s) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: s.id * 0.1 }}
                                className={`bg-gray-800 rounded-lg p-6 border-2 border-${s.color}-500/50`}
                            >
                                <h3 className={`text-xl font-bold text-${s.color}-400 mb-4`}>
                                    🎯 {s.name}
                                </h3>

                                {/* 模型选择 */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-300 mb-2">
                                        🤖 选择模型
                                    </label>
                                    <select
                                        value={s.model}
                                        onChange={(e) => updateSession(s.id, { model: e.target.value })}
                                        className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                                    >
                                        {MODEL_OPTIONS.map((group) => (
                                            <optgroup key={group.group} label={group.group}>
                                                {group.options.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                {/* 独立 System Prompt（如果不使用统一） */}
                                {!useUnifiedPrompt && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">
                                            📝 System Prompt
                                        </label>
                                        <textarea
                                            value={s.systemPrompt}
                                            onChange={(e) => updateSession(s.id, { systemPrompt: e.target.value })}
                                            placeholder="留空使用默认 prompt"
                                            className="w-full h-32 bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none text-sm font-mono"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* 统一 System Prompt 配置 */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">📝 System Prompt 配置</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useUnifiedPrompt}
                                    onChange={(e) => setUseUnifiedPrompt(e.target.checked)}
                                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-gray-300">使用统一 Prompt</span>
                            </label>
                        </div>

                        {useUnifiedPrompt && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">所有session使用相同的 prompt</span>
                                    <button
                                        onClick={copyDefaultPrompt}
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                    >
                                        📋 使用默认 Prompt
                                    </button>
                                </div>
                                <textarea
                                    value={unifiedPrompt}
                                    onChange={(e) => setUnifiedPrompt(e.target.value)}
                                    placeholder="输入统一的 System Prompt..."
                                    className="w-full h-48 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* 角色信息和策略选择 */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        {userCharacterInfo ? (
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    🎭 你将扮演：<span className="text-blue-400">{userCharacterInfo.scriptCharacterName}</span>
                                </h3>

                                {/* 故事背景 */}
                                <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
                                    <h4 className="text-lg font-bold text-green-400 mb-2">🌍 故事背景</h4>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                        {replaceCharacterVariables(userCharacterInfo.角色视角的故事背景)}
                                    </p>
                                </div>

                                {/* 选择点 */}
                                <div className="bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-700/50">
                                    <h4 className="text-lg font-bold text-yellow-400 mb-2">❓ 面临的选择</h4>
                                    <p className="text-gray-300">
                                        {replaceCharacterVariables(userCharacterInfo.第一个选择点)}
                                    </p>
                                </div>

                                {/* 策略选项 */}
                                <div className="space-y-3">
                                    <h4 className="text-lg font-bold text-white">💡 选择你的策略：</h4>
                                    {userCharacterInfo.预置策略选项?.map((option: any, index: number) => {
                                        const normalizedOption = typeof option === 'string'
                                            ? { id: `preset-${index}`, 文本: replaceCharacterVariables(option), 后果描述: '' }
                                            : { ...option, id: option.id || `preset-${index}`, 文本: replaceCharacterVariables(option.文本 || ''), 后果描述: replaceCharacterVariables(option.后果描述 || '') };

                                        const isSelected = selectedOption?.id === normalizedOption.id;

                                        return (
                                            <motion.button
                                                key={normalizedOption.id}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleOptionSelect(normalizedOption)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition ${isSelected
                                                    ? 'bg-gradient-to-r from-orange-600 to-yellow-600 border-orange-400'
                                                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                                                    }`}
                                            >
                                                <p className="font-bold text-white">
                                                    {isSelected && '✓ '}{normalizedOption.文本}
                                                </p>
                                                {normalizedOption.后果描述 && (
                                                    <p className="text-sm text-gray-400 mt-1">{normalizedOption.后果描述}</p>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* 确认按钮 */}
                                {selectedOption && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={handleConfirmSelection}
                                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-lg rounded-lg shadow-lg transition"
                                    >
                                        🚀 开始对比 (同时运行3个模型)
                                    </motion.button>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    💬 输入用户提示 (User Prompt)
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    输入你想要测试的用户提示内容，将会使用上面配置的 System Prompt 和模型进行对比。
                                </p>
                                <textarea
                                    value={customUserInput}
                                    onChange={(e) => setCustomUserInput(e.target.value)}
                                    placeholder="输入用户提示内容，例如：用户选择了继续调查照片中的线索..."
                                    className="w-full h-32 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none"
                                />

                                {/* 确认按钮 */}
                                {customUserInput.trim() && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleCustomConfirm()}
                                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-lg rounded-lg shadow-lg transition"
                                    >
                                        🚀 开始对比 (同时运行3个模型)
                                    </motion.button>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // 对比结果界面
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* 标题和重置按钮 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">⚖️ 模型对比结果</h1>
                        <p className="text-gray-400 mt-1">
                            选择：<span className="text-orange-400 font-bold">{selectedOption?.文本}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
                    >
                        🔄 重新对比
                    </button>
                </div>

                {/* 3个Session结果并排显示 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {sessions.map((s) => {
                        const colorClasses = {
                            blue: { border: 'border-blue-500', bg: 'from-blue-900/50 to-blue-800/30', text: 'text-blue-400', loading: 'border-blue-500' },
                            purple: { border: 'border-purple-500', bg: 'from-purple-900/50 to-purple-800/30', text: 'text-purple-400', loading: 'border-purple-500' },
                            green: { border: 'border-green-500', bg: 'from-green-900/50 to-green-800/30', text: 'text-green-400', loading: 'border-green-500' },
                        }[s.color] || { border: 'border-gray-500', bg: 'from-gray-900/50 to-gray-800/30', text: 'text-gray-400', loading: 'border-gray-500' };

                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: s.id * 0.1 }}
                                className={`bg-gradient-to-br ${colorClasses.bg} rounded-lg border-2 ${colorClasses.border} overflow-hidden`}
                            >
                                {/* Session 头部 */}
                                <div className={`px-4 py-3 bg-gray-900/50 border-b ${colorClasses.border}`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className={`font-bold ${colorClasses.text}`}>{s.name}</h3>
                                        {s.generationTime && (
                                            <span className="text-xs text-gray-400">
                                                ⏱️ {(s.generationTime / 1000).toFixed(2)}s
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {MODEL_OPTIONS.flatMap(g => g.options).find(o => o.value === s.model)?.label || s.model}
                                    </p>
                                </div>

                                {/* Session 内容 */}
                                <div className="p-4 min-h-64">
                                    {s.loading ? (
                                        <div className="flex flex-col items-center justify-center h-48">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                className={`w-12 h-12 border-4 border-gray-700 ${colorClasses.loading} border-t-current rounded-full mb-4`}
                                            />
                                            <p className="text-gray-400 text-sm">生成中...</p>
                                        </div>
                                    ) : s.error ? (
                                        <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/50">
                                            <p className="text-red-400 font-bold mb-2">❌ 生成失败</p>
                                            <p className="text-red-300 text-sm">{s.error}</p>
                                        </div>
                                    ) : s.response ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                {s.response}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-48 text-gray-500">
                                            等待生成...
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 对比统计 */}
                {sessions.every(s => !s.loading && (s.response || s.error)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">📊 对比统计</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {sessions.map((s) => {
                                const modelName = MODEL_OPTIONS.flatMap(g => g.options).find(o => o.value === s.model)?.label || s.model;
                                return (
                                    <div key={s.id} className="bg-gray-900 rounded-lg p-4">
                                        <p className="font-bold text-white mb-2">{s.name}</p>
                                        <p className="text-sm text-gray-400">{modelName}</p>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">响应时间:</span>
                                                <span className={s.error ? 'text-red-400' : 'text-green-400'}>
                                                    {s.generationTime ? `${(s.generationTime / 1000).toFixed(2)}s` : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">状态:</span>
                                                <span className={s.error ? 'text-red-400' : 'text-green-400'}>
                                                    {s.error ? '失败' : '成功'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">字数:</span>
                                                <span className="text-blue-400">
                                                    {s.response ? s.response.length : 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

