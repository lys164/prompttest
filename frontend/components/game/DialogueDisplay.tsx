'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueEntry {
    id: string;
    characterId: string;
    characterName: string;
    content: string;
    type: 'user-input' | 'ai-response' | 'narrative';
    timestamp: Date;
    modelUsed?: string;
    // 调试信息
    systemPrompt?: string;
    userPrompt?: string;
}

interface DialogueDisplayProps {
    dialogues: DialogueEntry[];
}

export default function DialogueDisplay({ dialogues }: DialogueDisplayProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {dialogues.map((dialogue, index) => (
                <motion.div
                    key={dialogue.id}
                    initial={{ opacity: 0, x: dialogue.type === 'user-input' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${dialogue.type === 'user-input' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className="w-full max-w-xs lg:max-w-sm">
                        <div
                            onClick={() => (dialogue.systemPrompt || dialogue.userPrompt) && toggleExpand(dialogue.id)}
                            className={`px-4 py-3 rounded-lg cursor-pointer transition-all ${(dialogue.systemPrompt || dialogue.userPrompt)
                                    ? 'hover:shadow-lg hover:shadow-green-500/30'
                                    : ''
                                } ${dialogue.type === 'user-input'
                                    ? 'bg-blue-900 text-blue-100 border border-blue-700'
                                    : dialogue.type === 'ai-response'
                                        ? 'bg-purple-900 text-purple-100 border border-purple-700'
                                        : 'bg-gray-700 text-gray-100 border border-gray-600'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-bold text-sm mb-2">
                                        {dialogue.characterName}
                                        {dialogue.modelUsed && (
                                            <span className="text-xs ml-2 opacity-75">({dialogue.modelUsed})</span>
                                        )}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{dialogue.content}</p>
                                </div>
                                {(dialogue.systemPrompt || dialogue.userPrompt) && (
                                    <div className="ml-2 flex-shrink-0">
                                        <span className="text-xs bg-green-500 text-white rounded px-2 py-1 font-bold">
                                            {expandedId === dialogue.id ? '▼' : '▶'} 日志
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs opacity-50 mt-2">
                                {new Date(dialogue.timestamp).toLocaleTimeString('zh-CN')}
                            </p>
                        </div>

                        {/* 展开的日志信息 */}
                        <AnimatePresence>
                            {expandedId === dialogue.id && (dialogue.systemPrompt || dialogue.userPrompt) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 bg-black/40 border border-green-500/50 rounded-lg p-3 space-y-3 text-xs"
                                >
                                    {dialogue.systemPrompt && (
                                        <div>
                                            <p className="font-bold text-green-400 mb-1">📋 System Prompt:</p>
                                            <div className="bg-black/60 p-2 rounded border border-green-500/30 max-h-40 overflow-y-auto">
                                                <code className="text-green-300 whitespace-pre-wrap break-words text-xs">
                                                    {dialogue.systemPrompt}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                    {dialogue.userPrompt && (
                                        <div>
                                            <p className="font-bold text-blue-400 mb-1">👤 User Prompt:</p>
                                            <div className="bg-black/60 p-2 rounded border border-blue-500/30 max-h-40 overflow-y-auto">
                                                <code className="text-blue-300 whitespace-pre-wrap break-words text-xs">
                                                    {dialogue.userPrompt}
                                                </code>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

