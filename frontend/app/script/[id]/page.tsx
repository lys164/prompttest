'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { scriptApi, gameApi } from '@/lib/api';
import { useGameStore } from '@/lib/store';
import CharacterSelector from '@/components/game/CharacterSelector';

export default function ScriptDetail() {
    const router = useRouter();
    const params = useParams();
    const scriptId = params.id as string;

    const [script, setScript] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [creatingSession, setCreatingSession] = useState(false);
    const [showCharacterSelector, setShowCharacterSelector] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'normal' | 'debug' | 'compare'>('normal');

    const setUserId = useGameStore((state) => state.setUserId);
    const userId = useGameStore((state) => state.userId);

    useEffect(() => {
        loadScriptDetails();
        // 设置一个默认的用户ID（在实际应用中应该从认证系统获取）
        if (!userId) {
            const tempUserId = `user-${Date.now()}`;
            setUserId(tempUserId);
        }
    }, [scriptId]);

    const loadScriptDetails = async () => {
        try {
            setLoading(true);
            const scriptRes = await scriptApi.getScriptDetail(scriptId);
            setScript(scriptRes.data);
        } catch (error) {
            console.error('Failed to load script details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = (mode: 'normal' | 'debug' | 'compare') => {
        setSelectedMode(mode);
        setShowCharacterSelector(true);
    };

    const handleCharacterMappingsConfirm = async (characterMappings: any[]) => {
        try {
            setCreatingSession(true);
            const response = await gameApi.createSession(
                scriptId,
                userId,
                characterMappings,
                selectedMode
            );
            const sessionId = response.data.sessionId;

            // 跳转到游戏页面
            router.push(`/game/${sessionId}?mode=${selectedMode}`);
        } catch (error) {
            console.error('Failed to create game session:', error);
            alert('创建游戏会话失败');
        } finally {
            setCreatingSession(false);
            setShowCharacterSelector(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-pulse">
                        <div className="h-16 w-16 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="mt-4 text-gray-400">加载剧本详情中...</p>
                </div>
            </div>
        );
    }

    if (!script) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">剧本不存在</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* 返回按钮 */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="mb-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
                >
                    ← 返回
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：剧本信息 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        {/* 标题 */}
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {script?.title || script?.剧本标题 || '未命名剧本'}
                        </h1>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-4 py-2 bg-blue-900 text-blue-300 rounded-full font-medium">
                                {script?.剧本类别}
                            </span>
                            {Array.isArray(script?.品类标签) && script?.品类标签.map((tag: string) => (
                                <span key={tag} className="px-4 py-2 bg-purple-900 text-purple-300 rounded-full font-medium text-sm">
                                    {tag}
                                </span>
                            ))}
                            <span className="px-4 py-2 bg-green-900 text-green-300 rounded-full font-medium">
                                ⏱️ {script?.预计时长} 分钟
                            </span>
                        </div>

                        {/* 简介 */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-3">📖 剧本简介</h2>
                            <p className="text-gray-300 leading-relaxed">{script?.剧本简介}</p>
                        </div>

                        {/* 背景故事 */}
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                            <h3 className="text-xl font-bold mb-3">🌍 故事背景</h3>
                            <p className="text-gray-300 leading-relaxed">{script?.故事内容}</p>
                        </div>
                    </motion.div>

                    {/* 右侧：游戏模式选择 */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-1"
                    >
                        <div className="sticky top-8">
                            {/* 所需角色数 */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 mb-6">
                                <h3 className="text-xl font-bold mb-4">👥 参与角色</h3>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-400 mb-2">
                                        {script?.参与AI数}
                                    </div>
                                    <p className="text-gray-300">个AI角色参与</p>
                                    <p className="text-sm text-gray-400 mt-3">
                                        你需要从自己的AI角色中选择{script?.参与AI数}个来扮演剧本中的角色
                                    </p>
                                </div>
                            </div>

                            {/* 游戏模式选择 */}
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 mb-6">
                                <h3 className="text-xl font-bold mb-4">🎮 游戏模式</h3>
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStartGame('normal')}
                                        disabled={creatingSession}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg font-bold text-white transition disabled:opacity-50"
                                    >
                                        {creatingSession ? '创建中...' : '▶️ 正常游玩'}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStartGame('debug')}
                                        disabled={creatingSession}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-bold text-white transition disabled:opacity-50"
                                    >
                                        🔧 调试模式
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStartGame('compare')}
                                        disabled={creatingSession}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-lg font-bold text-white transition disabled:opacity-50"
                                    >
                                        ⚖️ 对比模式
                                    </motion.button>
                                </div>
                            </div>

                            {/* 游戏模式说明 */}
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-sm text-gray-400">
                                <p className="font-bold text-white mb-2">💡 模式说明</p>
                                <ul className="space-y-2 text-xs">
                                    <li>🎮 <strong>正常游玩：</strong>完整的游戏体验</li>
                                    <li>🔧 <strong>调试模式：</strong>测试Prompt效果</li>
                                    <li>⚖️ <strong>对比模式：</strong>多模型效果对比</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* 角色选择弹窗 */}
            {showCharacterSelector && (
                <CharacterSelector
                    scriptId={scriptId}
                    userId={userId}
                    script={script}
                    onConfirm={handleCharacterMappingsConfirm}
                    onCancel={() => setShowCharacterSelector(false)}
                />
            )}
        </main>
    );
}
