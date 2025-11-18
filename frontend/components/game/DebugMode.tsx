'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { devApi } from '@/lib/api';
import { useDevStore } from '@/lib/store';

interface DebugModeProps {
    sessionId: string;
    script: any;
    characters: any[];
    isOpen: boolean;
}

export default function DebugMode({
    sessionId,
    script,
    characters,
    isOpen,
}: DebugModeProps) {
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('openai/gpt-5.1-chat');
    const [temperature, setTemperature] = useState(0.7);
    const [debugResponses, setDebugResponses] = useState<any[]>([]);
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

    const handleDebugPrompt = async () => {
        if (!customPrompt.trim()) {
            alert('请输入提示词');
            return;
        }

        try {
            setLoading(true);
            const response = await devApi.debugPrompt(customPrompt, selectedModel, temperature);
            setDebugResponses([response.data, ...debugResponses]);
        } catch (error) {
            console.error('Debug failed:', error);
            alert('调试失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center text-gray-400 py-20">
                    <p className="text-lg">🔧 开发者面板已关闭</p>
                    <p className="text-sm mt-2">在页面顶部打开开发者面板以访问调试功能</p>
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
                className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg p-8 border-2 border-purple-500/30"
            >
                <h2 className="text-3xl font-bold text-white mb-8">🔧 调试模式 - Prompt 效果测试</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：输入面板 */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4">📝 测试 Prompt</h3>

                            {/* 模型选择 */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2">选择模型</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                                >
                                    {models.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 温度控制 */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                    温度设置: {temperature.toFixed(2)}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    disabled={loading}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    值越低越确定，越高越创意
                                </p>
                            </div>

                            {/* Prompt 输入框 */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2">Prompt 内容</label>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    disabled={loading}
                                    placeholder="输入你想测试的提示词..."
                                    className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
                                />
                            </div>

                            {/* 提交按钮 */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDebugPrompt}
                                disabled={loading || !customPrompt.trim()}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '处理中...' : '▶️ 测试 Prompt'}
                            </motion.button>

                            {/* 快速模板 */}
                            <div className="mt-6 pt-6 border-t border-gray-600">
                                <p className="text-xs font-bold text-gray-300 mb-3">💡 快速模板</p>
                                <button
                                    onClick={() =>
                                        setCustomPrompt(
                                            `角色：${characters.map((c) => c.name).join('、')}\n背景：${script?.backgroundStory}\n\n请生成下一个故事段落...`
                                        )
                                    }
                                    className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition"
                                >
                                    📋 使用场景模板
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：结果展示 */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-h-96 overflow-y-auto">
                            <h3 className="text-lg font-bold text-white mb-4">
                                📊 测试结果 ({debugResponses.length})
                            </h3>

                            {debugResponses.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">
                                    <p className="text-sm">暂无测试结果</p>
                                    <p className="text-xs mt-2">提交一个 Prompt 开始测试</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {debugResponses.map((response, index) => (
                                        <motion.div
                                            key={response.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 bg-gray-900 rounded-lg border border-gray-600 hover:border-purple-500 transition"
                                        >
                                            {/* 测试信息头 */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-purple-400 text-sm">测试 #{index + 1}</p>
                                                    <p className="text-xs text-gray-400">
                                                        模型: {response.model} | 时间:{' '}
                                                        {new Date(response.timestamp).toLocaleTimeString('zh-CN')}
                                                    </p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    <p>输入: {response.tokens.input} tokens</p>
                                                    <p>输出: {response.tokens.output} tokens</p>
                                                </div>
                                            </div>

                                            {/* 提示词 */}
                                            <div className="mb-3 p-3 bg-gray-800 rounded border-l-2 border-blue-500">
                                                <p className="text-xs font-bold text-blue-400 mb-1">📝 Prompt:</p>
                                                <p className="text-xs text-gray-300 line-clamp-2">
                                                    {response.prompt}
                                                </p>
                                            </div>

                                            {/* 响应 */}
                                            <div className="p-3 bg-gray-800 rounded border-l-2 border-green-500">
                                                <p className="text-xs font-bold text-green-400 mb-1">✅ 响应:</p>
                                                <p className="text-sm text-gray-200 whitespace-pre-wrap line-clamp-4">
                                                    {response.response}
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

