'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { gameApi, scriptApi } from '@/lib/api';
import { useGameStore, useDevStore } from '@/lib/store';
import GamePlayMode from '@/components/game/GamePlayMode';
import DebugMode from '@/components/game/DebugMode';
import CompareMode from '@/components/game/CompareMode';

export default function GamePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = params.sessionId as string;
    const modeParam = searchParams.get('mode') || 'normal';

    const [session, setSession] = useState<any>(null);
    const [script, setScript] = useState<any>(null);
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gameMode, setGameMode] = useState<'normal' | 'debug' | 'compare'>(
        (modeParam as 'normal' | 'debug' | 'compare') || 'normal'
    );

    const isDevMode = useDevStore((state) => state.isDevMode);
    const toggleDevMode = useDevStore((state) => state.toggleDevMode);

    useEffect(() => {
        loadGameData();
    }, [sessionId]);

    const loadGameData = async () => {
        try {
            setLoading(true);
            
            // 第一步：加载 session
            const sessionRes = await gameApi.getSession(sessionId);
            let sessionData = sessionRes.data;
            
            // 立即设置 session，这样至少前端已经有会话数据
            setSession(sessionData);

            // 第二步：异步加载脚本详情（不需要阻塞主流程）
            try {
                console.log('📖 开始加载脚本详情，scriptId:', sessionData.scriptId);
                const scriptRes = await scriptApi.getScriptDetail(sessionData.scriptId);
                const scriptData = scriptRes.data;
                
                console.log('✅ 脚本详情加载完成:', scriptData.title);
                setScript(scriptData);

                // 第三步：加载角色信息
                try {
                    const characterRes = await scriptApi.getScriptCharacters(sessionData.scriptId);
                    setCharacters(characterRes.data);
                } catch (charError) {
                    console.warn('Failed to load characters:', charError);
                    setCharacters(scriptData?.角色池 || []);
                }

                // 第四步：为单人剧本生成 userCharacterInfo
                if (!sessionData.userCharacterInfo && scriptData) {
                    const firstRole = scriptData?.角色池?.[0];
                    const firstDetail = scriptData?.角色详细设定?.[0];
                    
                    console.log('🔍 生成单人剧本的 userCharacterInfo:');
                    console.log('  firstRole:', firstRole?.姓名);
                    console.log('  firstDetail:', firstDetail?.角色简介);
                    
                    if (firstRole && firstDetail) {
                        sessionData.userCharacterInfo = {
                            scriptRoleId: firstRole.roleId,
                            scriptCharacterName: firstRole.姓名,
                            角色简介: firstRole.角色简介,
                            角色目标: firstRole.角色目标,
                            角色视角的故事背景: firstDetail.角色视角的故事背景,
                            第一个选择点: firstDetail.第一个选择点,
                            预置策略选项: firstDetail.预置策略选项,
                        };
                        
                        // 更新 session 中的 userCharacterInfo
                        setSession({ ...sessionData });
                    }
                } else if (sessionData.userCharacterInfo) {
                    console.log('✅ 已有 userCharacterInfo:', sessionData.userCharacterInfo.scriptCharacterName);
                }
            } catch (scriptError) {
                console.error('Failed to load script details:', scriptError);
                // 即使脚本加载失败，也继续进行（至少已经有 session 数据）
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to load game data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="inline-block animate-pulse">
                        <div className="h-16 w-16 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="mt-4 text-gray-400">初始化游戏...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* 游戏头部 */}
            <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{script?.title}</h1>
                        <p className="text-gray-400 text-sm">
                            模式: {gameMode === 'normal' ? '🎮 正常游玩' : gameMode === 'debug' ? '🔧 调试模式' : '⚖️ 对比模式'}
                        </p>
                    </div>

                    {/* 模式切换按钮 */}
                    {gameMode !== 'normal' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleDevMode}
                            className={`px-4 py-2 rounded-lg font-medium transition ${isDevMode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {isDevMode ? '关闭开发者面板' : '打开开发者面板'}
                        </motion.button>
                    )}
                </div>
            </header>

            {/* 游戏主内容 */}
            <AnimatePresence mode="wait">
                {gameMode === 'normal' ? (
                    <GamePlayMode
                        key="game-play"
                        sessionId={sessionId}
                        script={script}
                        characters={characters}
                        session={session}
                        onSessionUpdate={setSession}
                    />
                ) : gameMode === 'debug' ? (
                    <DebugMode
                        key="debug-mode"
                        sessionId={sessionId}
                        script={script}
                        characters={characters}
                        isOpen={isDevMode}
                    />
                ) : (
                    <CompareMode
                        key="compare-mode"
                        sessionId={sessionId}
                        script={script}
                        characters={characters}
                        isOpen={isDevMode}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

