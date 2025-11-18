"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const firebase_1 = require("../config/firebase");
// 模拟数据 - 当 Firebase 无数据时使用
const mockUserAICharacters = new Map();
class UserService {
    constructor() {
        this.initializeSampleCharacters();
    }
    /**
     * 初始化示例AI角色
     */
    initializeSampleCharacters() {
        const mockCharacters = [
            {
                id: 'ai-char-001',
                userId: 'default-user',
                姓名: '勇敢的探险家',
                和用户的身份: '虚拟助手',
                超能力: [
                    {
                        名称: '探险直觉',
                        等级: 7,
                        描述: '能感知周围危险',
                    },
                ],
                是否有原型: false,
                年龄: 25,
                生日: '05-15',
                国籍: '冒险岛',
                语言: ['通用语', '古代密语'],
                外貌描述: '身材挺拔，眼神炯炯有神，穿着探险装',
                喜好特长: ['冒险', '解谜', '沟通'],
                讨厌的东西: ['谎言', '懦弱'],
                星座: '白羊座',
                MBTI: 'ENFP',
                面对未知的态度: '好奇心强',
                恐惧软肋: '害怕让伙伴失望',
                头像: '/avatars/adventurer.jpg',
                创建时间: new Date(),
                更新时间: new Date(),
            },
            {
                id: 'ai-char-002',
                userId: 'default-user',
                姓名: '智慧的魔法师',
                和用户的身份: '导师',
                超能力: [
                    {
                        名称: '魔法洞察',
                        等级: 9,
                        描述: '能理解复杂魔法原理',
                    },
                    {
                        名称: '元素控制',
                        等级: 8,
                        描述: '掌控四种元素',
                    },
                ],
                是否有原型: true,
                年龄: 150,
                生日: '12-21',
                国籍: '魔法联盟',
                语言: ['通用语', '古代魔法文'],
                外貌描述: '留着长髯，穿着神秘的法袍',
                喜好特长: ['魔法', '教学', '研究'],
                讨厌的东西: ['暴力', '浪费'],
                星座: '射手座',
                MBTI: 'INTJ',
                面对未知的态度: '谨慎研究',
                恐惧软肋: '失去知识',
                头像: '/avatars/mage.jpg',
                创建时间: new Date(),
                更新时间: new Date(),
            },
            {
                id: 'ai-char-003',
                userId: 'default-user',
                姓名: '忠诚的骑士',
                和用户的身份: '战友',
                超能力: [
                    {
                        名称: '剑术精通',
                        等级: 8,
                        描述: '刀法无敌',
                    },
                ],
                是否有原型: false,
                年龄: 35,
                生日: '03-10',
                国籍: '骑士王国',
                语言: ['通用语'],
                外貌描述: '肌肉发达，脸上有疤痕，眼神坚定',
                喜好特长: ['战斗', '保护', '正义'],
                讨厌的东西: ['背叛', '不公平'],
                星座: '金牛座',
                MBTI: 'ISTJ',
                面对未知的态度: '小心谨慎',
                恐惧软肋: '无法保护所爱的人',
                头像: '/avatars/knight.jpg',
                创建时间: new Date(),
                更新时间: new Date(),
            },
        ];
        mockUserAICharacters.set('default-user', mockCharacters);
    }
    /**
     * 获取用户的所有AI角色 - 混合方案
     * 优先从 livestory 集合读取，然后尝试 users 集合
     */
    async getUserAICharacters(userId) {
        try {
            // 第一优先级：从 livestory 集合读取
            const livestorySnapshot = await firebase_1.db.collection('livestory').get();
            if (!livestorySnapshot.empty) {
                console.log(`🤖 从 livestory 集合读取 ${livestorySnapshot.size} 个AI角色`);
                return this.mapFirebaseCharacters(livestorySnapshot);
            }
            // 第二优先级：从 users/{userId}/aiCharacters 读取
            const userSnapshot = await firebase_1.db
                .collection('users')
                .doc(userId)
                .collection('aiCharacters')
                .get();
            if (!userSnapshot.empty) {
                console.log(`🤖 从 Firebase 读取用户 ${userId} 的 ${userSnapshot.size} 个AI角色`);
                return this.mapFirebaseCharacters(userSnapshot);
            }
            else {
                console.warn(`⚠️  Firebase 中没有AI角色数据，使用模拟数据`);
                return this.getMockUserAICharacters(userId);
            }
        }
        catch (error) {
            console.error('❌ Firebase 读取AI角色失败:', error);
            return this.getMockUserAICharacters(userId);
        }
    }
    /**
     * 获取单个AI角色
     */
    async getUserAICharacter(userId, characterId) {
        try {
            const characters = await this.getUserAICharacters(userId);
            return characters.find((c) => c.id === characterId);
        }
        catch (error) {
            console.error('Failed to fetch AI character:', error);
            throw error;
        }
    }
    /**
     * 推荐合适的AI角色
     */
    async recommendCharacters(userId, recommendedTraits) {
        try {
            const characters = await this.getUserAICharacters(userId);
            if (characters.length === 0) {
                return [];
            }
            // 根据推荐的特征筛选角色
            return characters.filter((char) => recommendedTraits.some((trait) => char.喜好特长.includes(trait) ||
                char.MBTI.includes(trait) ||
                char.面对未知的态度.includes(trait)));
        }
        catch (error) {
            console.error('Failed to recommend characters:', error);
            throw error;
        }
    }
    // ===== 模拟数据方法 =====
    /**
     * 获取模拟的用户AI角色
     */
    getMockUserAICharacters(userId) {
        // 如果用户ID匹配，返回默认模拟数据
        if (mockUserAICharacters.has(userId)) {
            return mockUserAICharacters.get(userId) || [];
        }
        // 否则返回默认用户的模拟数据
        const defaultChars = mockUserAICharacters.get('default-user') || [];
        // 为新用户复制模拟数据（更新userId）
        const newUserChars = defaultChars.map((char) => ({
            ...char,
            userId,
            id: `ai-char-${userId}-${Math.random().toString(36).substr(2, 9)}`,
        }));
        // 缓存新用户的数据
        mockUserAICharacters.set(userId, newUserChars);
        return newUserChars;
    }
    // ===== Firebase 映射方法 =====
    /**
     * 映射单个 Firebase 文档为 UserAICharacter
     */
    mapFirebaseCharacter(doc) {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            姓名: data.姓名 || data.name,
            和用户的身份: data.和用户的身份 || data.identity,
            超能力: (data.超能力 || data.powers || []).map((p) => ({
                名称: p.名称 || p.name,
                等级: p.等级 || p.level,
                描述: p.描述 || p.description,
            })),
            是否有原型: data.是否有原型 || data.hasPrototype || false,
            年龄: data.年龄 || data.age,
            生日: data.生日 || data.birthday,
            国籍: data.国籍 || data.nationality,
            语言: data.语言 || data.languages || [],
            外貌描述: data.外貌描述 || data.appearance,
            喜好特长: data.喜好特长 || data.traits || [],
            讨厌的东西: data.讨厌的东西 || data.dislikes || [],
            星座: data.星座 || data.zodiac,
            MBTI: data.MBTI,
            面对未知的态度: data.面对未知的态度 || data.unknownAttitude,
            恐惧软肋: data.恐惧软肋 || data.fears,
            头像: data.头像 || data.avatar,
            创建时间: data.创建时间 ? new Date(data.创建时间.toDate?.() || data.创建时间) : new Date(),
            更新时间: data.更新时间 ? new Date(data.更新时间.toDate?.() || data.更新时间) : new Date(),
        };
    }
    /**
     * 映射多个 Firebase 文档为 UserAICharacter[]
     */
    mapFirebaseCharacters(snapshot) {
        const characters = [];
        snapshot.forEach((doc) => {
            characters.push(this.mapFirebaseCharacter(doc));
        });
        return characters;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
