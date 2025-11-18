import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AI互动影游 - 由大模型驱动的互动故事游戏',
    description: '体验由AI驱动的互动影视游戏。每个选择都会改变你的命运。支持单人、多人、多AI角色互动。',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}

