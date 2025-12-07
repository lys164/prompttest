'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameApi, devApi } from '@/lib/api';

interface CompareModeProps {
    sessionId: string;
    script: any;
    characters: any[];
    session: any;
    onSessionUpdate: (session: any) => void;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface SessionConfig {
    id: number;
    name: string;
    model: string;
    systemPrompt: string;
    chatHistory: ChatMessage[];
    loading: boolean;
    error: string | null;
    generationTime: number | null;
    color: string;
}

const DEFAULT_MODELS = [
    'doubao-seed-1-6-251015',
    'deepseek/deepseek-v3.2',
    'qwen/qwen3-max',
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
    const [currentRound, setCurrentRound] = useState(0);
    const [nextUserInput, setNextUserInput] = useState('');
    const chatContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

    // 3个session的配置
    const [sessions, setSessions] = useState<SessionConfig[]>([
        { id: 1, name: 'Session A', model: DEFAULT_MODELS[0], systemPrompt: '', chatHistory: [], loading: false, error: null, generationTime: null, color: 'blue' },
        { id: 2, name: 'Session B', model: DEFAULT_MODELS[1], systemPrompt: '', chatHistory: [], loading: false, error: null, generationTime: null, color: 'purple' },
        { id: 3, name: 'Session C', model: DEFAULT_MODELS[2], systemPrompt: '', chatHistory: [], loading: false, error: null, generationTime: null, color: 'green' },
    ]);

    // 是否使用统一的 system prompt
    const [useUnifiedPrompt, setUseUnifiedPrompt] = useState(true);
    const [unifiedPrompt, setUnifiedPrompt] = useState('');

    // 用户自定义输入
    const [customUserInput, setCustomUserInput] = useState('');

    useEffect(() => {
        initializeCompareMode();
    }, [sessionId, session]);

    // 滚动到最新消息
    useEffect(() => {
        chatContainerRefs.current.forEach((ref) => {
            if (ref) {
                ref.scrollTop = ref.scrollHeight;
            }
        });
    }, [sessions]);

    const initializeCompareMode = async () => {
        console.log('🔧 CompareMode 初始化开始');

        if (session?.userCharacterInfo) {
            console.log('✅ 找到 userCharacterInfo:', session.userCharacterInfo.scriptCharacterName);
            setUserCharacterInfo(session.userCharacterInfo);
        } else {
            console.log('⚠️ 没有 userCharacterInfo');
        }

        setGameStarted(false);

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

        setIsInitialized(true);
        console.log('✅ CompareMode 初始化完成');
    };

    const updateSession = (sessionId: number, updates: Partial<SessionConfig>) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, ...updates } : s
        ));
    };

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

    const handleOptionSelect = (option: any) => {
        setSelectedOption(option);
    };

    const handleCustomConfirm = async () => {
        const option = { id: 'custom', 文本: customUserInput };
        setSelectedOption(option);
        await runComparison(option.文本);
    };

    const handleConfirmSelection = async () => {
        if (!selectedOption) return;
        await runComparison(selectedOption.文本);
    };

    // 执行对比（支持多轮）
    const runComparison = async (userInput: string) => {
        setGameStarted(true);
        setCurrentRound(prev => prev + 1);

        const userMessage: ChatMessage = {
            role: 'user',
            content: userInput,
            timestamp: Date.now(),
        };

        // 添加用户消息到所有 session 的历史
        sessions.forEach(s => {
            updateSession(s.id, {
                chatHistory: [...s.chatHistory, userMessage],
                loading: true,
                error: null,
                generationTime: null,
            });
        });

        try {
            // 构建包含历史的用户提示
            const buildUserPromptWithHistory = (chatHistory: ChatMessage[], newUserInput: string) => {
                if (chatHistory.length <= 1) {
                    // 第一轮
                    return `用户选择了：${newUserInput}\n\n请根据这个选择生成故事的下一步发展。`;
                } else {
                    // 多轮对话：包含历史
                    let historyText = '以下是之前的对话历史：\n\n';
                    chatHistory.slice(0, -1).forEach((msg, idx) => {
                        if (msg.role === 'user') {
                            historyText += `【用户选择 ${Math.floor(idx / 2) + 1}】${msg.content}\n\n`;
                        } else {
                            historyText += `【故事发展 ${Math.floor(idx / 2) + 1}】${msg.content.substring(0, 500)}...\n\n`;
                        }
                    });
                    historyText += `---\n\n现在用户做出了新的选择：${newUserInput}\n\n请基于以上历史和新选择，继续推进故事发展。`;
                    return historyText;
                }
            };

            // 使用高级对比 API 并行调用所有模型
            const currentSessions = sessions.map(s => ({
                ...s,
                chatHistory: [...s.chatHistory, userMessage],
            }));

            const compareResponse = await devApi.compareAdvanced(
                currentSessions.map(s => ({
                    id: String(s.id),
                    model: s.model,
                    systemPrompt: useUnifiedPrompt ? unifiedPrompt : (s.systemPrompt || defaultSystemPrompt),
                    userPrompt: buildUserPromptWithHistory(s.chatHistory, userInput),
                    temperature: 0.7,
                }))
            );

            // 处理响应
            if (compareResponse?.success && compareResponse?.data?.results) {
                compareResponse.data.results.forEach((result: any) => {
                    const sid = parseInt(result.id);
                    const currentSession = sessions.find(s => s.id === sid);
                    if (!currentSession) return;

                    if (result.success) {
                        const assistantMessage: ChatMessage = {
                            role: 'assistant',
                            content: result.response,
                            timestamp: Date.now(),
                        };
                        updateSession(sid, {
                            chatHistory: [...currentSession.chatHistory, userMessage, assistantMessage],
                            loading: false,
                            generationTime: result.generationTime,
                        });
                    } else {
                        updateSession(sid, {
                            chatHistory: [...currentSession.chatHistory, userMessage],
                            error: result.error || '生成失败',
                            loading: false,
                            generationTime: result.generationTime,
                        });
                    }
                });
            } else {
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

        setNextUserInput('');
    };

    // 继续对话
    const handleContinueConversation = async () => {
        if (!nextUserInput.trim()) return;
        await runComparison(nextUserInput);
    };

    // 重置对比
    const handleReset = () => {
        setGameStarted(false);
        setSelectedOption(null);
        setCurrentRound(0);
        setNextUserInput('');
        setSessions(prev => prev.map(s => ({
            ...s,
            chatHistory: [],
            loading: false,
            error: null,
            generationTime: null,
        })));
    };

    const copyDefaultPrompt = () => {
        setUnifiedPrompt(defaultSystemPrompt);
    };

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
                        <p className="text-gray-400">同时运行3个session，对比不同模型的效果，支持多轮对话</p>
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

                                <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
                                    <h4 className="text-lg font-bold text-green-400 mb-2">🌍 故事背景</h4>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                        {replaceCharacterVariables(userCharacterInfo.角色视角的故事背景)}
                                    </p>
                                </div>

                                <div className="bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-700/50">
                                    <h4 className="text-lg font-bold text-yellow-400 mb-2">❓ 面临的选择</h4>
                                    <p className="text-gray-300">
                                        {replaceCharacterVariables(userCharacterInfo.第一个选择点)}
                                    </p>
                                </div>

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

    // 对比结果界面（支持多轮对话）
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {/* 标题和控制按钮 */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">⚖️ 多轮对话对比</h1>
                        <p className="text-gray-400 mt-1">
                            当前轮次：<span className="text-orange-400 font-bold">第 {currentRound} 轮</span>
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
                    >
                        🔄 重新开始
                    </button>
                </div>

                {/* 3个Session对话历史并排显示 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {sessions.map((s, idx) => {
                        const colorClasses = {
                            blue: { border: 'border-blue-500', bg: 'from-blue-900/50 to-blue-800/30', text: 'text-blue-400', userBg: 'bg-blue-900/50', assistantBg: 'bg-gray-800' },
                            purple: { border: 'border-purple-500', bg: 'from-purple-900/50 to-purple-800/30', text: 'text-purple-400', userBg: 'bg-purple-900/50', assistantBg: 'bg-gray-800' },
                            green: { border: 'border-green-500', bg: 'from-green-900/50 to-green-800/30', text: 'text-green-400', userBg: 'bg-green-900/50', assistantBg: 'bg-gray-800' },
                        }[s.color] || { border: 'border-gray-500', bg: 'from-gray-900/50 to-gray-800/30', text: 'text-gray-400', userBg: 'bg-gray-700', assistantBg: 'bg-gray-800' };

                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: s.id * 0.1 }}
                                className={`bg-gradient-to-br ${colorClasses.bg} rounded-lg border-2 ${colorClasses.border} overflow-hidden flex flex-col`}
                            >
                                {/* Session 头部 */}
                                <div className={`px-4 py-3 bg-gray-900/50 border-b ${colorClasses.border}`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className={`font-bold ${colorClasses.text}`}>{s.name}</h3>
                                        <span className="text-xs text-gray-400">
                                            {s.chatHistory.filter(m => m.role === 'assistant').length} 轮
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {MODEL_OPTIONS.flatMap(g => g.options).find(o => o.value === s.model)?.label || s.model}
                                    </p>
                                </div>

                                {/* 对话历史区域 */}
                                <div
                                    ref={el => { chatContainerRefs.current[idx] = el; }}
                                    className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] min-h-[300px]"
                                >
                                    <AnimatePresence>
                                        {s.chatHistory.map((msg, msgIdx) => (
                                            <motion.div
                                                key={`${s.id}-${msgIdx}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`rounded-lg p-3 ${msg.role === 'user' ? colorClasses.userBg : colorClasses.assistantBg}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-xs font-bold ${msg.role === 'user' ? colorClasses.text : 'text-gray-400'}`}>
                                                        {msg.role === 'user' ? '👤 用户选择' : '🤖 AI 回复'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        #{Math.floor(msgIdx / 2) + 1}
                                                    </span>
                                                </div>
                                                <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                                                    {msg.content}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* 加载状态 */}
                                    {s.loading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className={`w-5 h-5 border-2 border-gray-600 ${colorClasses.border} border-t-current rounded-full`}
                                            />
                                            <span className="text-gray-400 text-sm">生成中...</span>
                                        </motion.div>
                                    )}

                                    {/* 错误状态 */}
                                    {s.error && (
                                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/50">
                                            <p className="text-red-400 font-bold text-sm mb-1">❌ 生成失败</p>
                                            <p className="text-red-300 text-xs">{s.error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Session 底部统计 */}
                                <div className={`px-4 py-2 bg-gray-900/50 border-t ${colorClasses.border} text-xs text-gray-500`}>
                                    {s.generationTime && (
                                        <span>最后响应: {(s.generationTime / 1000).toFixed(2)}s</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* 继续对话区域 */}
                {sessions.every(s => !s.loading) && sessions.some(s => s.chatHistory.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">💬 继续对话</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            输入你的下一步选择或行动，所有session将继续基于各自的历史进行对话。
                        </p>
                        <div className="flex gap-4">
                            <textarea
                                value={nextUserInput}
                                onChange={(e) => setNextUserInput(e.target.value)}
                                placeholder="输入你的下一个选择，例如：我决定仔细检查那个可疑的设备..."
                                className="flex-1 h-24 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.metaKey && nextUserInput.trim()) {
                                        handleContinueConversation();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500">⌘ + Enter 快速发送</span>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleContinueConversation}
                                disabled={!nextUserInput.trim()}
                                className={`px-8 py-3 rounded-lg font-bold transition ${nextUserInput.trim()
                                    ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                🚀 发送到所有Session
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* 对比统计 */}
                {sessions.every(s => !s.loading) && sessions.some(s => s.chatHistory.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">📊 对话统计</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {sessions.map((s) => {
                                const modelName = MODEL_OPTIONS.flatMap(g => g.options).find(o => o.value === s.model)?.label || s.model;
                                const totalChars = s.chatHistory
                                    .filter(m => m.role === 'assistant')
                                    .reduce((sum, m) => sum + m.content.length, 0);
                                const rounds = s.chatHistory.filter(m => m.role === 'assistant').length;

                                return (
                                    <div key={s.id} className="bg-gray-900 rounded-lg p-4">
                                        <p className="font-bold text-white mb-2">{s.name}</p>
                                        <p className="text-sm text-gray-400 truncate">{modelName}</p>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">对话轮数:</span>
                                                <span className="text-blue-400">{rounds}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">总字数:</span>
                                                <span className="text-green-400">{totalChars}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">最后响应:</span>
                                                <span className={s.error ? 'text-red-400' : 'text-green-400'}>
                                                    {s.generationTime ? `${(s.generationTime / 1000).toFixed(2)}s` : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">状态:</span>
                                                <span className={s.error ? 'text-red-400' : 'text-green-400'}>
                                                    {s.error ? '失败' : '正常'}
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
