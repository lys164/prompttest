'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Choice {
    id: string;
    text: string;
    consequence?: string;
}

interface ChoiceButtonsProps {
    choices: Choice[];
    onSelect: (choiceId: string) => void;
    loading?: boolean;
}

export default function ChoiceButtons({
    choices,
    onSelect,
    loading = false,
}: ChoiceButtonsProps) {
    return (
        <div className="space-y-3">
            {choices.map((choice, index) => (
                <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(choice.id)}
                    disabled={loading}
                    className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 border-2 border-blue-700 hover:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="font-bold text-blue-300 mr-3">{index + 1}.</span>
                    <span className="text-white">{choice.text}</span>
                    {choice.consequence && (
                        <p className="text-xs text-blue-200 mt-2 ml-6">💡 {choice.consequence}</p>
                    )}
                </motion.button>
            ))}
        </div>
    );
}

