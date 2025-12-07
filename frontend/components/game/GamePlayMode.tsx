'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { gameApi } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import DialogueDisplay from './DialogueDisplay';
import ChoiceButtons from './ChoiceButtons';

interface GamePlayModeProps {
    sessionId: string;
    script: any;
    characters: any[];
    session: any;
    onSessionUpdate: (session: any) => void;
}

export default function GamePlayMode({
    sessionId,
    script,
    characters,
    session,
    onSessionUpdate,
}: GamePlayModeProps) {
    const [narrative, setNarrative] = useState<string>('');
    const [choices, setChoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogueHistory, setDialogueHistory] = useState<any[]>([]);
    const [userInput, setUserInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [userCharacterInfo, setUserCharacterInfo] = useState<any>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<any>(null);

    // 调试面板状态
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [systemPromptOverride, setSystemPromptOverride] = useState('');
    const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-preview-09-2025');
    const [currentSystemPrompt, setCurrentSystemPrompt] = useState('');

    useEffect(() => {
        // 初始化游戏场景
        initializeGame();

        // 连接 WebSocket
        wsClient.connect(sessionId).catch(error => {
            console.error('⚠️ WebSocket 连接失败:', error);
        });

        // 注册 WebSocket 消息处理器
        wsClient.on('story_generated', handleStoryGenerated);
        wsClient.on('story_error', handleStoryError);

        // 清理：断开 WebSocket 连接
        return () => {
            wsClient.disconnect();
        };
    }, [sessionId]);

    // 调试相关功能已移除，保持玩法简洁一致

    const initializeGame = async () => {
        try {
            setLoading(true);
            // 加载对话历史
            const historyRes = await gameApi.getDialogueHistory(sessionId);
            setDialogueHistory(historyRes.data);

            // 检查是否有用户角色信息（单人和多人剧本都可能有）
            if (session?.userCharacterInfo) {
                // 显示用户角色的初始化界面
                setUserCharacterInfo(session.userCharacterInfo);
                setGameStarted(false);
                setLoading(false);
                return;
            }

            // 如果没有userCharacterInfo，直接开始游戏
            startGame();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            setLoading(false);
        }
    };

    const startGame = async () => {
        try {
            setLoading(true);
            // 设置初始叙述
            setNarrative(
                `欢迎来到《${script?.title}》！\n\n${script?.backgroundStory}\n\n故事即将开始...`
            );

            // 设置初始选择
            setChoices([
                { id: '1', text: '准备好了，让我们开始吧！' },
                { id: '2', text: '我想先了解更多背景信息' },
                { id: '3', text: '告诉我更多关于这些角色的信息' },
            ]);
        } catch (error) {
            console.error('Failed to initialize game:', error);
        } finally {
            setLoading(false);
        }
    };

    // 用户选择一个选项（但不确认）
    const handleOptionSelect = (option: any) => {
        setSelectedOption(option);
        console.log('📌 用户选中了选项:', option.文本);
    };

    // WebSocket 消息处理：故事生成完成
    const handleStoryGenerated = (message: any) => {
        console.log('✅ 收到生成的故事');
        console.log('📦 完整的 WebSocket 消息:', JSON.stringify(message, null, 2));

        // 检查消息结构
        if (!message || !message.data) {
            console.error('❌ WebSocket 消息格式错误，缺少 data 字段:', message);
            setError('接收到的故事数据格式错误');
            setLoading(false);
            return;
        }

        setNarrative(message.data.narrative);
        setChoices(message.data.options || []);
        setDialogueHistory(message.data.dialogueHistory || []);

        // 更新调试面板：获取最新的 system prompt
        if (message.data.dialogueHistory && message.data.dialogueHistory.length > 0) {
            const latestAIResponse = message.data.dialogueHistory
                .filter((entry: any) => entry.type === 'ai-response')
                .pop();
            if (latestAIResponse?.systemPrompt) {
                setCurrentSystemPrompt(latestAIResponse.systemPrompt);
            }
        }

        setLoading(false);
        setError(null);  // 清除可能存在的错误状态
        setSelectedOption(null);
    };

    // WebSocket 消息处理：故事生成错误
    const handleStoryError = (message: any) => {
        console.error('❌ 故事生成错误:', message.error);
        // 只有在确实收到错误消息时才显示错误
        if (message.error && message.error.trim().length > 0) {
            setError(message.error);
            setLoading(false);
            // 3秒后重置
            setTimeout(() => {
                setError(null);
                setGameStarted(false);
                setSelectedStrategy(null);
            }, 3000);
        }
    };

    // 用户点击确认按钮
    const handleConfirmSelection = async () => {
        if (!selectedOption) return;
        await handleStrategySelection(selectedOption);
    };

    const handleStrategySelection = async (strategy: any) => {
        try {
            setLoading(true);
            setSelectedStrategy(strategy);
            setGameStarted(true);  // 立即进入"生成中"界面
            setSelectedOption(null);

            console.log('🎬 用户确认了策略:', strategy.文本);
            console.log('📡 提交选择到后端（异步处理）');
            // 提交策略选择到后端（后端会异步处理 AI 请求）
            const response = await gameApi.submitChoice(sessionId, {
                choiceId: `strategy-${strategy.id}`,
                userInput: strategy.文本,
                systemPromptOverride: systemPromptOverride || undefined,
                selectedModel: selectedModel || undefined,
            });

            console.log('📦 后端响应:', response);

            // 检查是否是立即返回的"生成中"状态
            // 注意：gameApi.submitChoice 已经返回了 response.data，所以这里直接访问 response.status
            if (response?.status === 'generating') {
                console.log('⏳ 后端已收到请求，正在异步生成故事...');
                // 继续等待 WebSocket 消息
                // WebSocket 会在故事生成完成后发送 'story_generated' 消息
            } else if (response?.narrative) {
                // 如果不是异步处理，直接处理响应（兼容旧版本）
                console.log('📖 模型返回的响应:', response);
                setNarrative(response.narrative);
                setChoices(response.options || response.choices || []);

                if (response.dialogueHistory) {
                    setDialogueHistory(response.dialogueHistory);
                }

                setLoading(false);
                setSelectedOption(null);
            } else {
                // 异步处理模式 - 等待 WebSocket 消息
                console.log('⏳ 异步模式 - 等待 WebSocket 消息...');
            }
        } catch (error) {
            // 只有在提交请求本身失败时才显示错误（如网络错误）
            // AI 生成过程中的错误会通过 WebSocket 的 story_error 消息处理
            const errorMsg = error instanceof Error ? error.message : '提交请求失败，请重试';
            console.error('❌ 提交策略选择失败:', error);
            setError(errorMsg);
            setLoading(false);
            // 重置选择状态以便重试
            setTimeout(() => {
                setGameStarted(false);
                setSelectedStrategy(null);
                setError(null);
                setSelectedOption(null);
            }, 3000);
        }
    };

    // 替换故事中的角色变量（如 {{角色A}}、{{角色B}} 等）
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

                const labelMatch = mapping.scriptRoleId.match(/^角色([A-Z])$/);
                if (labelMatch) {
                    const labelRegex = new RegExp(`{{角色${labelMatch[1]}}}`, 'g');
                    result = result.replace(labelRegex, characterName);
                }
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

    const handleChoice = async (choice: any) => {
        try {
            setLoading(true);
            let payloadChoiceId: string;
            let payloadUserInput: string | undefined;

            if (choice === 'custom') {
                payloadChoiceId = 'custom';
                payloadUserInput = userInput.trim();
            } else {
                const choiceData = typeof choice === 'string' ? { id: choice } : choice;
                payloadChoiceId = choiceData.id || choiceData.choiceId || choiceData.value || choiceData;
                const choiceText = choiceData.文本 || choiceData.text || choiceData.label || choiceData.description;
                payloadUserInput = choiceText || `选择了选项: ${payloadChoiceId}`;
            }

            const response = await gameApi.submitChoice(sessionId, {
                choiceId: payloadChoiceId,
                userInput: payloadUserInput,
                systemPromptOverride: systemPromptOverride || undefined,
                selectedModel: selectedModel || undefined,
            });

            console.log('📦 handleChoice 收到响应:', response);

            // 检查是否是异步生成模式
            if (response?.status === 'generating') {
                console.log('⏳ 异步生成中，等待 WebSocket 消息...');
                // WebSocket 会处理后续更新，这里只需要保持 loading 状态
                // loading 会在 handleStoryGenerated 中被设置为 false
            } else if (response?.narrative) {
                // 同步模式或兼容旧版本
                console.log('📖 同步模式，直接更新界面');
                setNarrative(response.narrative);
                setChoices(response.options || response.choices || []);

                if (response.dialogueHistory) {
                    setDialogueHistory(response.dialogueHistory);
                }

                setLoading(false);
            }

            // 清空用户输入
            setUserInput('');
            setShowCustomInput(false);
        } catch (error) {
            console.error('Failed to submit choice:', error);
            const errorMsg = error instanceof Error ? error.message : '提交选择失败，请重试';
            setError(errorMsg);
            setLoading(false);
            // 3秒后清除错误
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
        // 注意：不在 finally 中设置 setLoading(false)
        // 异步生成模式下，loading 会在 handleStoryGenerated 中设置为 false
    };

    // 多人剧本：显示角色初始化界面
    if (!gameStarted && userCharacterInfo) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 border border-gray-700"
                >
                    {/* 角色初始化界面 */}
                    <div className="space-y-6">
                        {/* 标题 */}
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                🎭 你将扮演
                            </h2>
                            <h1 className="text-5xl font-bold text-white">{userCharacterInfo.scriptCharacterName}</h1>
                        </div>

                        {/* 角色信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 角色简介 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-900 rounded-lg p-6 border border-gray-700"
                            >
                                <h3 className="text-xl font-bold text-blue-400 mb-3">📖 角色简介</h3>
                                <p className="text-gray-300 leading-relaxed">{userCharacterInfo.角色简介}</p>
                            </motion.div>

                            {/* 角色目标 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-900 rounded-lg p-6 border border-gray-700"
                            >
                                <h3 className="text-xl font-bold text-purple-400 mb-3">🎯 角色目标</h3>
                                <p className="text-gray-300 leading-relaxed">{userCharacterInfo.角色目标}</p>
                            </motion.div>
                        </div>

                        {/* 角色视角的故事背景 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-900 rounded-lg p-6 border border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-green-400 mb-3">🌍 故事背景</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {replaceCharacterVariables(userCharacterInfo.角色视角的故事背景)}
                            </p>
                        </motion.div>

                        {/* 第一个选择点 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-700/50"
                        >
                            <h3 className="text-xl font-bold text-yellow-400 mb-3">❓ 面临的选择</h3>
                            <p className="text-gray-300 leading-relaxed text-lg">{replaceCharacterVariables(userCharacterInfo.第一个选择点)}</p>
                        </motion.div>

                        {/* 预置策略选项 */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">💡 你的决策</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {userCharacterInfo.预置策略选项?.map((option: any, index: number) => {
                                    const normalizedOption =
                                        typeof option === 'string'
                                            ? {
                                                id: `preset-${index}`,
                                                文本: replaceCharacterVariables(option),
                                                后果描述: '',
                                            }
                                            : {
                                                ...option,
                                                id: option.id || `preset-${index}`,
                                                文本: replaceCharacterVariables(option.文本 || ''),
                                                后果描述: replaceCharacterVariables(option.后果描述 || ''),
                                            };

                                    const isSelected = selectedOption?.id === normalizedOption.id;
                                    return (
                                        <motion.button
                                            key={normalizedOption.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 10 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOptionSelect(normalizedOption)}
                                            disabled={loading}
                                            className={`text-left p-4 rounded-lg border-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 border-green-400 shadow-lg shadow-green-500/50'
                                                : 'bg-gradient-to-r from-blue-900 to-blue-800 border-blue-700 hover:from-blue-800 hover:to-blue-700 hover:border-blue-600'
                                                }`}
                                        >
                                            <p className="font-bold mb-1">
                                                {isSelected && '✓ '}
                                                <span className={isSelected ? 'text-white' : 'text-blue-300'}>
                                                    {normalizedOption.文本}
                                                </span>
                                            </p>
                                            <p className={`text-sm ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
                                                {normalizedOption.后果描述}
                                            </p>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* 确认按钮 */}
                            {selectedOption && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={handleConfirmSelection}
                                    disabled={loading}
                                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ✓ 确认选择
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 如果正在加载且游戏已开始，显示对话框等待界面
    if ((loading || error) && gameStarted && selectedStrategy) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {/* 对话框 - 等待模型响应 或 错误提示 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-lg p-12 border-2 min-h-64 flex flex-col items-center justify-center ${error
                                ? 'bg-gradient-to-br from-red-900 to-red-950 border-red-500/50'
                                : 'bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/50'
                                }`}
                        >
                            <div className="text-center">
                                {error ? (
                                    <>
                                        {/* 错误提示 */}
                                        <div className="text-5xl mb-4">⚠️</div>
                                        <h2 className="text-3xl font-bold text-red-300 mb-4">故事生成失败</h2>
                                        <p className="text-lg text-red-200 mb-6">{error}</p>
                                        <p className="text-gray-300">系统将在3秒后返回选择界面，请重试...</p>
                                    </>
                                ) : (
                                    <>
                                        {/* 动画加载指示器 */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="mx-auto mb-6 w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                                        />

                                        <h2 className="text-3xl font-bold text-white mb-4">📖 故事正在生成中...</h2>
                                        <p className="text-xl text-gray-300 mb-2">您的选择：<span className="text-blue-400 font-bold">{selectedStrategy?.文本}</span></p>
                                        <p className="text-gray-400 mb-8">AI 正在为您编织故事的下一章</p>

                                        {/* 加载进度提示 */}
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-sm text-gray-500"
                                        >
                                            ⏳ 请稍候...
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* 侧边栏 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4">🎭 参与角色</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {characters && characters.length > 0 ? (
                                    characters.map((char) => (
                                        <div
                                            key={char.id || char.roleId}
                                            className="p-3 bg-gray-900 rounded-lg border border-gray-600"
                                        >
                                            <p className="font-bold text-white text-sm">{char.姓名 || char.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{char.角色简介 || char.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">暂无角色信息</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 主游戏区域 */}
                <div className="lg:col-span-3">
                    {/* 叙述区域 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 mb-8 border border-gray-700 min-h-64"
                    >
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg leading-relaxed text-gray-100 whitespace-pre-wrap">
                                {replaceCharacterVariables(narrative)}
                            </p>
                        </div>
                    </motion.div>

                    {/* 选择按钮区域 */}
                    {choices && choices.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-4 mb-8"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">💡 请选择你的下一步行动：</h3>

                            {choices.map((choice, index) => (
                                <motion.button
                                    key={choice.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 10 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleChoice(choice)}
                                    disabled={loading}
                                    className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 border-2 border-blue-700 hover:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="font-bold text-blue-300 mr-3">{index + 1}.</span>
                                    <span className="text-white">{choice.text}</span>
                                </motion.button>
                            ))}

                            {/* 自定义输入选项 */}
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: choices.length * 0.1 }}
                                whileHover={{ scale: 1.02, x: 10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowCustomInput(!showCustomInput)}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-purple-900 to-purple-800 hover:from-purple-800 hover:to-purple-700 border-2 border-purple-700 hover:border-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="font-bold text-purple-300 mr-3">✏️</span>
                                <span className="text-white">
                                    {showCustomInput ? '隐藏自定义输入' : '自定义你的行动'}
                                </span>
                            </motion.button>

                            {/* 自定义输入框 */}
                            {showCustomInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                                >
                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder="描述你想要做的事情..."
                                        className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleChoice('custom')}
                                        disabled={loading || !userInput.trim()}
                                        className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '处理中...' : '提交行动'}
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* 侧边栏：角色和历史 */}
                <div className="lg:col-span-1 space-y-6">
                    {/* 角色卡片 */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">🎭 参与角色</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {characters && characters.length > 0 ? (
                                characters.map((char) => (
                                    <div
                                        key={char.id || char.roleId}
                                        className="p-3 bg-gray-900 rounded-lg border border-gray-600 hover:border-blue-500 transition"
                                    >
                                        <p className="font-bold text-white text-sm">{char.姓名 || char.name}</p>
                                        <p className="text-xs text-gray-400 mt-1">{char.角色简介 || char.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">暂无角色信息</p>
                            )}
                        </div>
                    </div>

                    {/* 游戏统计 */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">📊 游戏进度</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">对话轮数：</span>
                                <span className="text-blue-400 font-bold">{dialogueHistory.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">选择数：</span>
                                <span className="text-green-400 font-bold">
                                    {dialogueHistory.filter((d) => d.type === 'user-input').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">当前状态：</span>
                                <span className="text-yellow-400 font-bold">进行中</span>
                            </div>
                        </div>
                    </div>

                    {/* 加载指示器 */}
                    {loading && (
                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/50 animate-pulse">
                            <p className="text-blue-400 text-sm text-center">AI正在生成故事...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 对话历史展示 */}
            {dialogueHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                    <h3 className="text-2xl font-bold text-white mb-6">💬 对话历史</h3>
                    <DialogueDisplay dialogues={dialogueHistory} />
                </motion.div>
            )}

            {/* 调试面板切换按钮 */}
            <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold shadow-lg transition"
            >
                🔧 {showDebugPanel ? '关闭调试' : '调试面板'}
            </button>

            {/* 调试面板 */}
            {showDebugPanel && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-blue-500 p-6 z-40 shadow-2xl max-h-96 overflow-y-auto"
                >
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">🔧 调试面板</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* System Prompt 显示与编辑 */}
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">
                                    📝 System Prompt 覆盖：
                                    <span className="text-xs text-gray-500 ml-2">(留空使用默认)</span>
                                </label>
                                <textarea
                                    value={systemPromptOverride}
                                    onChange={(e) => setSystemPromptOverride(e.target.value)}
                                    className="w-full h-40 bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-sm"
                                    placeholder="输入自定义 system prompt，留空则使用默认"
                                />

                                {currentSystemPrompt && (
                                    <div className="mt-2">
                                        <button
                                            onClick={() => setSystemPromptOverride(currentSystemPrompt)}
                                            className="text-xs text-blue-400 hover:text-blue-300 underline"
                                        >
                                            📋 复制当前使用的 prompt 到编辑区
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 当前使用的 System Prompt 显示 */}
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">
                                    👀 当前实际使用的 System Prompt：
                                </label>
                                <div className="w-full h-40 bg-gray-800 text-gray-400 rounded-lg p-3 border border-gray-700 overflow-y-auto font-mono text-xs whitespace-pre-wrap">
                                    {currentSystemPrompt || '暂无（尚未生成故事）'}
                                </div>
                            </div>

                            {/* 模型选择 */}
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-300">
                                    🤖 AI 模型选择：
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                                >
                                    <optgroup label="🔥 推荐模型">
                                        <option value="google/gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash (快速多模态)</option>
                                        <option value="openai/gpt-5.1-chat">GPT-5.1 (最新通用)</option>
                                        <option value="anthropic/claude-haiku-4.5">Claude 4.5 Haiku (推理)</option>
                                    </optgroup>
                                    <optgroup label="🚀 OpenRouter 模型">
                                        <option value="x-ai/grok-4-fast">Grok 4 Fast (快速推理)</option>
                                        <option value="qwen/qwen3-next-80b-a3b-instruct">Qwen3 Next 80B (阿里)</option>
                                        <option value="meituan/longcat-flash-chat:free">LongCat Flash (长上下文)</option>
                                        <option value="deepseek/deepseek-chat-v3.1:free">DeepSeek V3.1 (深度优化)</option>
                                        <option value="moonshotai/kimi-k2:free">Kimi K2 (中文优化)</option>
                                        <option value="thedrummer/anubis-70b-v1.1">Anubis 70B V1.1 (专业)</option>
                                        <option value="thedrummer/skyfall-36b-v2">Skyfall 36B V2 (平衡)</option>
                                        <option value="zhipu/glm-4.6-flash">GLM-4.6 Flash (智谱)</option>
                                        <option value="moonshotai/kimi-k2-0711-preview">Kimi K2 Preview (Moonshot)</option>
                                        <option value="qwen/qwen3-235b-a22b">Qwen3 Max 235B (阿里)</option>
                                    </optgroup>
                                    <optgroup label="📦 OpenAI 备用">
                                        <option value="gpt-4">GPT-4 (经典)</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (高效)</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={() => {
                                        setSystemPromptOverride('');
                                        setSelectedModel('google/gemini-2.5-flash-preview-09-2025');
                                    }}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
                                >
                                    🔄 重置
                                </button>
                                <button
                                    onClick={() => setShowDebugPanel(false)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition"
                                >
                                    ✅ 应用并关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

