'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { devApi } from '@/lib/api';

interface CompareModeProps {
    sessionId: string;
    script: any;
    characters: any[];
    isOpen: boolean;
}

export default function CompareMode({
    sessionId,
    script,
    characters,
    isOpen,
}: CompareModeProps) {
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedModels, setSelectedModels] = useState<string[]>([
        'openai/gpt-5.1-chat',
        'anthropic/claude-haiku-4.5',
        'google/gemini-2.5-flash-preview-09-2025',
    ]);
    const [compareResults, setCompareResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState<any[]>([]);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const response = await devApi.getAvailableModels();
            setModels(response.data);
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    };

    const toggleModel = (modelId: string) => {
        setSelectedModels((prev) =>
            prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
        );
    };

    const handleCompare = async () => {
        if (!customPrompt.trim()) {
            alert('请输入提示词');
            return;
        }

        if (selectedModels.length < 2) {
            alert('请选择至少2个模型进行对比');
            return;
        }

        try {
            setLoading(true);
            const response = await devApi.compareModels(customPrompt, selectedModels);
            setCompareResults([response.data, ...compareResults]);
        } catch (error) {
            console.error('Compare failed:', error);
            alert('对比失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center text-gray-400 py-20">
                    <p className="text-lg">⚖️ 对比模式已关闭</p>
                    <p className="text-sm mt-2">在页面顶部打开开发者面板以访问对比功能</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-lg p-8 border-2 border-orange-500/30"
            >
                <h2 className="text-3xl font-bold text-white mb-8">⚖️ 对比模式 - 多模型效果对比</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：输入面板 */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4">⚙️ 配置对比</h3>

                            {/* 模型选择 */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-3">
                                    选择模型({selectedModels.length}个)
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {models.map((model) => (
                                        <motion.div
                                            key={model.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="flex items-center p-3 bg-gray-900 rounded-lg border border-gray-600 hover:border-orange-500 cursor-pointer transition"
                                            onClick={() => toggleModel(model.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedModels.includes(model.id)}
                                                onChange={() => { }}
                                                className="w-4 h-4 mr-3"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">{model.name}</p>
                                                <p className="text-xs text-gray-400">{model.provider}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Prompt 输入框 */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2">Prompt 内容</label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    disabled={loading}
                                    placeholder="输入你想对比的提示词..."
                                    className="w-full h-40 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
                                />
                            </div>

                            {/* 提交按钮 */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCompare}
                                disabled={loading || !customPrompt.trim() || selectedModels.length < 2}
                                className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '对比中...' : '🚀 开始对比'}
                            </motion.button>

                            {/* 快速模板 */}
                            <div className="mt-6 pt-6 border-t border-gray-600">
                                <p className="text-xs font-bold text-gray-300 mb-3">💡 快速模板</p>
                                <button
                                    onClick={() =>
                                        setCustomPrompt(
                                            `角色：${characters.map((c) => c.name).join('、')}\n背景：${script?.backgroundStory}\n\n生成一个吸引人的故事段落，包含一些戏剧性的冲突...`
                                        )
                                    }
                                    className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition"
                                >
                                    📋 使用场景模板
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：结果对比 */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-bold text-white mb-4">📊 对比结果</h3>

                            {compareResults.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">
                                    <p className="text-sm">暂无对比结果</p>
                                    <p className="text-xs mt-2">选择2个或以上的模型并提交 Prompt 开始对比</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {compareResults.map((result, resultIndex) => (
                                        <motion.div
                                            key={resultIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-gray-900 rounded-lg border border-gray-600"
                                        >
                                            {/* 对比编号 */}
                                            <p className="font-bold text-orange-400 mb-4">
                                                对比 #{resultIndex + 1} - {new Date(result.timestamp).toLocaleTimeString('zh-CN')}
                                            </p>

                                            {/* Prompt */}
                                            <div className="mb-4 p-3 bg-gray-800 rounded border-l-2 border-blue-500">
                                                <p className="text-xs font-bold text-blue-400 mb-1">📝 Prompt:</p>
                                                <p className="text-xs text-gray-300 line-clamp-2">{result.prompt}</p>
                                            </div>

                                            {/* 模型响应对比 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {result.results.map((modelResult: any, index: number) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="p-3 bg-gray-800 rounded border-2 border-gray-700 hover:border-orange-500 transition"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-bold text-orange-400 text-sm">
                                                                {modelResult.model}
                                                            </p>
                                                            <div className="text-xs text-gray-400">
                                                                <p>⏱️ {modelResult.time}ms</p>
                                                                <p>📊 {modelResult.tokens} tokens</p>
                                                            </div>
                                                        </div>
                                                        <div className="p-2 bg-gray-900 rounded border border-gray-600">
                                                            <p className="text-xs text-gray-200 line-clamp-4 whitespace-pre-wrap">
                                                                {modelResult.response}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* 对比分析 */}
                                            <div className="mt-3 p-3 bg-blue-900/20 rounded border border-blue-500/20">
                                                <p className="text-xs font-bold text-blue-400 mb-2">🔍 简单分析:</p>
                                                <p className="text-xs text-gray-300">
                                                    响应速度最快: <span className="font-bold text-green-400">
                                                        {
                                                            result.results.reduce((min: any, curr: any) =>
                                                                curr.time < min.time ? curr : min
                                                            ).model
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

