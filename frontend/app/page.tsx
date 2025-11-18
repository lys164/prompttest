'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scriptApi } from '@/lib/api';

export default function Home() {
    const [scripts, setScripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<string | null>(null);

    useEffect(() => {
        loadScripts();
    }, []);

    const loadScripts = async () => {
        try {
            setLoading(true);
            const response = await scriptApi.getAllScripts(category || undefined);
            setScripts(response.data);
        } catch (error) {
            console.error('Failed to load scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = (cat: string | null) => {
        setCategory(cat);
    };

    useEffect(() => {
        loadScripts();
    }, [category]);

    return (
        <main className="min-h-screen">
            {/* 剧本大厅 */}
            <section className="max-w-6xl mx-auto py-12 px-4">
                {/* 分类筛选 */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">🎭 剧本大厅</h2>
                    <div className="flex flex-wrap gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryFilter(null)}
                            className={`px-6 py-3 rounded-lg font-medium transition ${category === null
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            全部剧本
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryFilter('【单人】【单AI】')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${category === '【单人】【单AI】'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            👤 单人×单AI
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryFilter('【单人】【多AI】')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${category === '【单人】【多AI】'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            👥 单人×多AI
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryFilter('【多人】【多AI】')}
                            className={`px-6 py-3 rounded-lg font-medium transition ${category === '【多人】【多AI】'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            👫 多用户×多AI
                        </motion.button>
                    </div>
                </div>

                {/* 剧本列表 */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-pulse">
                            <div className="h-12 w-12 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                        <p className="mt-4 text-gray-400">加载剧本中...</p>
                    </div>
                ) : scripts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl text-gray-400">暂无剧本</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scripts.map((script, index) => (
                            <motion.div
                                key={script.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Link href={`/script/${script.id}`}>
                                    <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border border-gray-700 hover:border-blue-500">
                                        {/* 封面图 */}
                                        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50">
                                                🎬
                                            </div>
                                        </div>

                                        {/* 内容 */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2 text-white">{script.title || script.剧本标题 || '未命名'}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{script.description || script.剧本简介}</p>

                                            {/* 标签 */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs font-medium">
                                                    {script.剧本类别}
                                                </span>
                                                {Array.isArray(script.品类标签) && script.品类标签.slice(0, 2).map((tag: string) => (
                                                    <span key={tag} className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-xs font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* 参与角色数和时间 */}
                                            <div className="flex items-center justify-between text-gray-500 text-sm">
                                                <p>👥 需要 {script.参与AI数} 个AI</p>
                                                <p>⏱️ 约 {script.预计时长} 分钟</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
}

