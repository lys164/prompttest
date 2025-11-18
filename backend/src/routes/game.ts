import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { scriptService } from '../services/scriptService';
import { aiService } from '../services/aiService';
import { userService } from '../services/userService';
import { GameSession, CharacterMapping, DialogueEntry } from '../types';
import { broadcastToSession } from '../index';
import { db } from '../config/firebase';

const router: Router = express.Router();

// 存储游戏会话
const sessions: Map<string, GameSession> = new Map();

/**
 * 获取用户的AI角色
 * GET /api/game/user-characters/:userId
 */
router.get('/user-characters/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 获取用户的AI角色（如果没有则自动使用模拟数据）
        const characters = await userService.getUserAICharacters(userId);

        res.json({
            success: true,
            data: characters,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取推荐的AI角色
 * GET /api/game/recommend-characters/:userId?traits=trait1,trait2
 */
router.get('/recommend-characters/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { traits = '' } = req.query;

    try {
        const traitArray = typeof traits === 'string' ? traits.split(',') : [];
        const recommended = await userService.recommendCharacters(userId, traitArray);

        res.json({
            success: true,
            data: recommended,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 创建新的游戏会话
 * POST /api/game/sessions
 * Body: { scriptId: string, userId: string, characterMappings: CharacterMapping[], mode: string }
 */
router.post('/sessions', async (req: Request, res: Response) => {
    let { scriptId, userId, characterMappings, mode = 'normal' } = req.body;

    try {
        // 🔍 解码 scriptId（处理 URL 编码的中文字符）
        scriptId = decodeURIComponent(scriptId);

        // 🔍 调试日志：打印接收到的所有数据
        console.log('📝 [创建游戏会话] 接收到的请求：');
        console.log('  scriptId (解码后):', scriptId);
        console.log('  scriptId 类型:', typeof scriptId);
        console.log('  userId:', userId);
        console.log('  characterMappings 数量:', characterMappings?.length);
        console.log('  mode:', mode);

        if (!scriptId || !userId || !characterMappings || characterMappings.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: scriptId, userId, characterMappings',
            });
        }

        // 获取剧本
        console.log('🔍 尝试从 Firebase 获取剧本，ID:', scriptId);
        const script = await scriptService.getScriptById(scriptId);
        console.log('📖 Firebase 返回的剧本:', script ? `找到 (${script.id})` : '未找到');
        if (!script) {
            return res.status(404).json({
                success: false,
                error: 'Script not found',
            });
        }

        // 判断是否为多人剧本
        const isMultiPlayer = script.剧本类别?.includes('【多人】') || false;
        const requiredCount = script.参与AI数;

        // 验证角色数量
        if (isMultiPlayer) {
            // 多人剧本：1-X 个角色
            if (characterMappings.length < 1 || characterMappings.length > requiredCount) {
                return res.status(400).json({
                    success: false,
                    error: `多人剧本需要 1-${requiredCount} 个角色，但提供了 ${characterMappings.length} 个`,
                });
            }
        } else {
            // 单人剧本：必须 X 个角色
            if (characterMappings.length !== requiredCount) {
            return res.status(400).json({
                success: false,
                    error: `单人剧本需要 ${requiredCount} 个角色，但提供了 ${characterMappings.length} 个`,
            });
        }
        }

        // 缓存每个映射对应的 AI 角色信息，避免后续重复读取导致数据缺失
        characterMappings = await Promise.all(
            characterMappings.map(async (mapping: CharacterMapping, index: number) => {
                try {
                    console.log(`🔍 查找 AI 角色: userId=${userId}, characterId=${mapping.userAICharacterId}`);
                    const userAICharacter = await userService.getUserAICharacter(userId, mapping.userAICharacterId);
                    if (!userAICharacter) {
                        console.warn(`⚠️ 未找到用户 ${userId} 的 AI 角色 ${mapping.userAICharacterId}`);
                    } else {
                        console.log(`✅ 找到 AI 角色: ${userAICharacter.姓名} (id: ${userAICharacter.id})`);
                    }
                    return {
                        ...mapping,
                        userAICharacterName: mapping.userAICharacterName || userAICharacter?.姓名 || `AI角色${index + 1}`,
                        userAICharacter,
                    };
                } catch (err) {
                    console.warn(`⚠️ 获取 AI 角色 ${mapping.userAICharacterId} 失败:`, err);
                    return mapping;
                }
            })
        );

        // 创建会话
        const session: GameSession = {
            id: uuidv4(),
            scriptId,
            userId,
            characterMappings,
            mode: mode as 'normal' | 'debug' | 'compare',
            currentSceneId: `scene-${Date.now()}`,
            currentChoicePoint: script.角色池[0]?.第一个选择点 || '接下来你该做什么？',
            dialogueHistory: [],
            choiceHistory: [],
            startedAt: new Date(),
            updatedAt: new Date(),
            status: 'ongoing',
        };

        sessions.set(session.id, session);

        // 为所有剧本生成用户角色信息
        let userCharacterInfo = null;

        // 确定用户角色：多人剧本随机选择，单人剧本选择第一个
        let userCharacterMapping;
        if (isMultiPlayer) {
            // 多人剧本：随机选择一个作为用户角色
            const randomIndex = Math.floor(Math.random() * characterMappings.length);
            userCharacterMapping = characterMappings[randomIndex];
            console.log(`🎭 多人剧本随机分配用户角色，索引: ${randomIndex}`);
        } else {
            // 单人剧本：选择第一个（通常只有一个）
            userCharacterMapping = characterMappings[0];
            console.log(`🎭 单人剧本选择第一个用户角色`);
        }

        // 获取脚本的第一个角色作为故事主角
        const firstScriptRole = script.角色池?.[0];
        const firstScriptDetail = script.角色详细设定?.[0];

        console.log(`📖 脚本第一个角色: ${firstScriptRole?.姓名}, roleId: ${firstScriptRole?.roleId}`);

        if (firstScriptRole && firstScriptDetail) {
            // 为了替换变量，需要创建临时的 participatingCharacters 数组
            // 这里使用的是简化版本，只包含必要的信息
            const tempParticipatingCharacters = characterMappings.map((mapping: any) => ({
                scriptRoleId: mapping.scriptRoleId,
                userAICharacterName: mapping.userAICharacterName,
            }));

            userCharacterInfo = {
                scriptRoleId: firstScriptRole.roleId,
                userAICharacterId: userCharacterMapping.userAICharacterId,
                userAICharacterName: userCharacterMapping.userAICharacterName,
                scriptCharacterName: firstScriptRole.姓名,
                角色简介: scriptService.replaceCharacterVariables(firstScriptRole.角色简介 || '', tempParticipatingCharacters as any),
                角色目标: scriptService.replaceCharacterVariables(firstScriptRole.角色目标 || '', tempParticipatingCharacters as any),
                角色视角的故事背景: scriptService.replaceCharacterVariables(firstScriptDetail.角色视角的故事背景 || '', tempParticipatingCharacters as any),
                第一个选择点: scriptService.replaceCharacterVariables(firstScriptDetail.第一个选择点 || '', tempParticipatingCharacters as any),
                预置策略选项: (firstScriptDetail.预置策略选项 || []).map((opt: any) => {
                    if (typeof opt === 'string') {
                        return scriptService.replaceCharacterVariables(opt, tempParticipatingCharacters as any);
                    } else if (typeof opt === 'object') {
                        return {
                            ...opt,
                            文本: scriptService.replaceCharacterVariables(opt.文本 || '', tempParticipatingCharacters as any),
                            后果描述: scriptService.replaceCharacterVariables(opt.后果描述 || '', tempParticipatingCharacters as any),
                        };
                    }
                    return opt;
                }),
            };
            console.log(`✅ 生成用户角色信息: ${firstScriptRole.姓名}`);
        } else {
            console.warn(`⚠️ 无法生成用户角色信息，脚本角色池为空或详细设定为空`);
        }

        // 💾 保存会话到 Firebase（用于持久化和服务器重启恢复）
        try {
            await db.collection('gameSessions').doc(session.id).set(session);
            console.log(`✅ 会话已保存到 Firebase: ${session.id}`);
        } catch (saveError) {
            console.warn(`⚠️ 保存会话到 Firebase 失败: ${saveError}`);
            // 继续运行，即使保存失败也不影响用户体验
        }

        res.status(201).json({
            success: true,
            data: {
                sessionId: session.id,
                script,
                characterMappings,
                initialChoicePoint: session.currentChoicePoint,
                isMultiPlayer,
                userCharacterInfo, // 多人剧本时包含用户角色信息
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取游戏会话信息
 * GET /api/game/sessions/:sessionId
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        // 首先尝试从内存中获取会话
        let session = sessions.get(sessionId);

        // 如果内存中没有，尝试从 Firebase 恢复
        if (!session) {
            console.log(`🔍 会话 ${sessionId} 不在内存中，尝试从 Firebase 恢复...`);
            try {
                const doc = await db.collection('gameSessions').doc(sessionId).get();
                if (doc.exists) {
                    session = doc.data() as GameSession;
                    sessions.set(sessionId, session);
                    console.log(`✅ 从 Firebase 恢复会话: ${sessionId}`);
                }
            } catch (firebaseError) {
                console.warn(`⚠️ 从 Firebase 恢复会话失败: ${firebaseError}`);
            }
        }

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
            });
        }

        res.json({
            success: true,
            data: session,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 提交选择并生成故事
 * POST /api/game/sessions/:sessionId/choose
 * Body: { choiceId: string, userInput?: string }
 */
router.post('/sessions/:sessionId/choose', async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { choiceId, userInput, systemPromptOverride, selectedModel } = req.body;

    try {
        let session = sessions.get(sessionId);

        // 如果内存中没有会话，尝试从 Firebase 恢复
        if (!session) {
            console.error(`❌ 会话 ${sessionId} 不在内存中，尝试从 Firebase 恢复...`);
            try {
                const doc = await db.collection('gameSessions').doc(sessionId).get();
                if (doc.exists) {
                    session = doc.data() as GameSession;
                    sessions.set(sessionId, session);
                    console.log(`✅ 从 Firebase 恢复会话: ${sessionId}`);
                } else {
                    console.error(`❌ Firebase 中也找不到会话 ${sessionId}`);
                }
            } catch (firebaseError) {
                console.warn(`⚠️ 从 Firebase 恢复会话失败: ${firebaseError}`);
            }
        }

        if (!session) {
            console.log(`📝 当前内存中的会话数: ${sessions.size}`);
            console.log(`📝 所有会话ID: ${Array.from(sessions.keys()).join(', ')}`);
            return res.status(404).json({
                success: false,
                error: 'Session not found - server may have restarted. Please start a new game.',
                sessionId,
            });
        }

        const normalizedUserChoice =
            typeof userInput === 'string' && userInput.trim().length > 0
                ? userInput.trim()
                : `选择了选项: ${choiceId}`;

        // 记录用户选择
        const userChoice: DialogueEntry = {
            id: uuidv4(),
            roleId: 'player',
            userAICharacterId: 'player',
            userAICharacterName: '玩家',
            scriptCharacterName: '玩家',
            content: normalizedUserChoice,
            type: 'user-input',
            timestamp: new Date(),
        };
        session.dialogueHistory.push(userChoice);

        // 获取剧本和参与的角色
        const script = await scriptService.getScriptById(session.scriptId);
        if (!script) {
            return res.status(404).json({
                success: false,
                error: 'Script not found',
            });
        }

        // 构建参与的角色信息
        const participatingCharacters = await Promise.all(
            session.characterMappings.map(async (mapping) => {
                console.log(`🔍 [choose] 开始构建角色 - scriptRoleId: ${mapping.scriptRoleId}, characterId: ${mapping.userAICharacterId}`);
                let userAIChar = mapping.userAICharacter;

                if (!userAIChar) {
                    console.log(`⚠️ [choose] 缓存中没有 userAICharacter，尝试查询...`);
                    userAIChar = await userService.getUserAICharacter(
                    session.userId,
                    mapping.userAICharacterId
                );

                    if (userAIChar) {
                        console.log(`✅ [choose] 查询成功: ${userAIChar.姓名} (MBTI: ${userAIChar.MBTI}, 年龄: ${userAIChar.年龄})`);
                        mapping.userAICharacter = userAIChar;
                    } else {
                        console.warn(`❌ [choose] 找不到用户AI角色 ${mapping.userAICharacterId}，使用映射信息作为占位`);
                    }
                } else {
                    console.log(`✅ [choose] 使用缓存的 userAICharacter: ${userAIChar.姓名} (MBTI: ${userAIChar.MBTI || '未知'}, 年龄: ${userAIChar.年龄 || '未知'})`);
                }

                // 查找脚本角色 - 首先尝试精确匹配 roleId，否则使用第一个角色
                let scriptChar = script.角色池.find((c) => c.roleId === mapping.scriptRoleId);
                if (!scriptChar && script.角色池.length > 0) {
                    console.warn(`⚠️ 找不到 roleId 为 ${mapping.scriptRoleId} 的角色，使用第一个角色替代`);
                    scriptChar = script.角色池[0];
                }

                let charDetail = script.角色详细设定.find((d) => d.roleId === mapping.scriptRoleId);
                if (!charDetail && script.角色详细设定.length > 0) {
                    console.warn(`⚠️ 找不到 roleId 为 ${mapping.scriptRoleId} 的详细设定，使用第一个替代`);
                    charDetail = script.角色详细设定[0];
                }

                // 记录调试信息
                console.log(`📖 构建参与角色 - mapping: ${mapping.scriptRoleId}`);
                console.log(`  scriptChar: ${scriptChar ? scriptChar.姓名 : 'undefined'}`);
                console.log(`  charDetail: ${charDetail ? charDetail.角色简介?.substring(0, 20) : 'undefined'}`);

                return {
                    userAICharacterId: mapping.userAICharacterId,
                    userAICharacter: userAIChar || ({
                        id: mapping.userAICharacterId,
                        姓名: mapping.userAICharacterName || '未知角色',
                    } as any),
                    scriptRoleId: mapping.scriptRoleId,
                    scriptCharacter: scriptChar || ({ 姓名: '角色', 角色简介: '剧本角色' } as any),
                    roleDetail: charDetail || ({ 角色简介: '角色描述', 角色视角的故事背景: '故事背景' } as any),
                };
            })
        );

        // 确定脚本类型并获取对应的 system prompt 模板
        let promptType = 'single-single-sp'; // 默认值
        if (script.剧本类别.includes('【多人】') && script.剧本类别.includes('【多AI】')) {
            promptType = 'multi-multi-sp';
        } else if (script.剧本类别.includes('【单人】') && script.剧本类别.includes('【多AI】')) {
            promptType = 'single-multi-sp';
        }

        console.log(`📋 脚本类型: ${script.剧本类别}，使用 prompt 类型: ${promptType}`);

        // 从 Firebase Prompts 集合获取 system prompt 和 user prompt 模板
        let systemPromptTemplate = await scriptService.getSystemPromptTemplate(promptType);

        // 转换为用户提示类型（single-single-sp -> single-single-up）
        const userPromptType = promptType.replace('-sp', '-up');
        let userPromptTemplate = await scriptService.getUserPromptTemplate(userPromptType);

        // 构建用于替换的变量对象 - 支持多种变量格式以适配不同的 prompt 模板
        const replacements: { [key: string]: string } = {};

        // AI 角色信息 - 构建单个角色的详细信息
        participatingCharacters.forEach((pc, index) => {
            const ua = pc.userAICharacter || {};
            const prefix = index === 0 ? '' : `${index + 1}_`; // 第一个角色不加前缀

            // 基础信息
            replacements[`${prefix}姓名`] = ua.姓名 || '未知';
            replacements[`${prefix}和用户的身份`] = ua.和用户的身份 || '未知';
            replacements[`${prefix}年龄`] = String(ua.年龄 || '未知');
            replacements[`${prefix}国籍`] = ua.国籍 || '未知';
            replacements[`${prefix}外貌描述`] = ua.外貌描述 || '未知';
            replacements[`${prefix}星座`] = ua.星座 || '未知';
            replacements[`${prefix}MBTI`] = ua.MBTI || '未知';
            replacements[`${prefix}面对未知的态度`] = ua.面对未知的态度 || '未知';
            replacements[`${prefix}恐惧/软肋`] = ua.恐惧软肋 || '未知';

            // 数组类型信息
            replacements[`${prefix}喜好/特长`] = (Array.isArray(ua.喜好特长) ? ua.喜好特长 : []).join('、') || '未知';
            replacements[`${prefix}讨厌的东西`] = (Array.isArray(ua.讨厌的东西) ? ua.讨厌的东西 : []).join('、') || '未知';

            // 超能力信息
            if (Array.isArray(ua.超能力) && ua.超能力.length > 0) {
                replacements[`${prefix}超能力（等级）`] = ua.超能力.map((p: any) => `${p.名称}(${p.等级})`).join('、');
                replacements[`${prefix}超能力`] = ua.超能力.map((p: any) => `${p.名称}：${p.描述}`).join('；');
            } else {
                replacements[`${prefix}超能力（等级）`] = '无';
                replacements[`${prefix}超能力`] = '暂无';
            }
        });

        // 组合所有 AI 角色信息（用于一次性引用所有角色）
        replacements['AI角色名'] = participatingCharacters.map(pc => pc.userAICharacter?.姓名 || '未知').join('、');
        replacements['AI角色身份'] = participatingCharacters.map(pc => pc.userAICharacter?.和用户的身份 || '未知').join('、');
        replacements['AI角色年龄'] = participatingCharacters.map(pc => String(pc.userAICharacter?.年龄 || '未知')).join('、');
        replacements['AI角色国籍'] = participatingCharacters.map(pc => pc.userAICharacter?.国籍 || '未知').join('、');
        replacements['AI角色MBTI'] = participatingCharacters.map(pc => pc.userAICharacter?.MBTI || '未知').join('、');
        replacements['AI角色性格'] = participatingCharacters.map(pc => {
            const traits = Array.isArray(pc.userAICharacter?.喜好特长)
                ? pc.userAICharacter.喜好特长.join('、')
                : '未知';
            return traits;
        }).join(' | ');

        // 脚本角色信息 - 同样支持多角色
        participatingCharacters.forEach((pc, index) => {
            const prefix = index === 0 ? '' : `${index + 1}_`;
            const rd = pc.roleDetail || {};
            const sc = pc.scriptCharacter || {};

            replacements[`${prefix}脚本角色名`] = sc.姓名 || '未知';
            replacements[`${prefix}角色简介`] = rd.角色简介 || '未知';
            replacements[`${prefix}角色目标`] = sc.角色目标 || '未知';
            replacements[`${prefix}角色背景`] = rd.角色视角的故事背景 || '未知';
        });

        // 组合脚本角色信息
        replacements['脚本角色'] = participatingCharacters.map(pc => pc.scriptCharacter?.姓名 || '未知').join('、');
        replacements['角色背景'] = participatingCharacters.map(pc => pc.roleDetail?.角色视角的故事背景 || '未知').join('\n\n');
        replacements['角色目标'] = participatingCharacters.map(pc => pc.scriptCharacter?.角色目标 || '未知').join('、');

        // 故事背景
        replacements['故事内容'] = script.故事内容 || '故事背景';
        replacements['剧本名'] = (script as any).title || script.id || '故事';

        // 角色网络信息
        const scriptData = (script as any);
        if (scriptData.角色网络) {
            replacements['角色网络'] = JSON.stringify(scriptData.角色网络, null, 2);
        } else {
            replacements['角色网络'] = '暂无角色网络信息';
        }

        // 获取角色设定模板并构建角色描述
        console.log(`📋 获取角色设定模板: ${promptType}`);
        const characterTemplate = await scriptService.getCharacterTemplate(promptType);

        // 为每个参与角色构建详细的角色设定
        const characterDescriptions: string[] = participatingCharacters.map((pc) =>
            scriptService.buildCharacterDescription(
                characterTemplate,
                pc.userAICharacter,
                pc.scriptCharacter,
                pc.roleDetail
            )
        );

        // 将所有角色的设定组合成一个字符串
        replacements['角色设定'] = characterDescriptions.join('\n\n');

        console.log(`✅ 角色设定已生成，共 ${participatingCharacters.length} 个角色`);

        // 为用户提示添加额外的上下文变量
        // 这些变量在对话过程中会更新
        const firstRole = script.角色池?.[0];
        const firstDetail = script.角色详细设定?.[0];

        const aiHistory = session.dialogueHistory.filter((entry: DialogueEntry) => entry.type === 'ai-response');
        const hasPreviousAiResponses = aiHistory.length > 0;

        if (hasPreviousAiResponses) {
            replacements['角色视角的故事背景'] =
                session.currentChoicePoint ||
                aiHistory[aiHistory.length - 1]?.content ||
                script.故事内容 ||
                '故事背景';
            replacements['上一个选择点'] = '';
        } else {
            replacements['角色视角的故事背景'] =
                firstDetail?.角色视角的故事背景 ||
                firstRole?.角色视角的故事背景 ||
                script.故事内容 ||
                '故事背景';
            replacements['上一个选择点'] =
                firstDetail?.第一个选择点 ||
                firstRole?.第一个选择点 ||
                session.currentChoicePoint ||
                '选择点';
        }

        replacements['用户选择的选项的具体内容'] = normalizedUserChoice;
        // 暂时不填充"已发生的关键剧情"，保持为默认提示
        replacements['历史重要情节'] = '故事刚刚开始';

        // 替换 system prompt 模板中的变量
        let customSystemPrompt = scriptService.replacePromptTemplate(systemPromptTemplate, replacements);

        // 替换 user prompt 模板中的变量
        let customUserPrompt = scriptService.replacePromptTemplate(userPromptTemplate, replacements);

        // 再替换角色变量（{{角色A}}, {{角色B}} 等）
        customSystemPrompt = scriptService.replaceCharacterVariables(customSystemPrompt, participatingCharacters);
        customUserPrompt = scriptService.replaceCharacterVariables(customUserPrompt, participatingCharacters);

        console.log(`✅ System prompt 准备就绪，长度: ${customSystemPrompt.length}`);
        console.log(`✅ User prompt 准备就绪，长度: ${customUserPrompt.length}`);

        // 立即返回 "生成中" 状态给前端
        res.json({
            success: true,
            status: 'generating',
            message: '正在生成故事，请稍候...',
        });

        // 异步处理 AI 请求（后台运行，不阻塞响应）
        (async () => {
            try {
                console.log(`🚀 开始异步生成故事...`);

                // 调试信息：输出使用的配置
                if (systemPromptOverride) {
                    console.log(`🔧 使用自定义系统提示`);
                }
                if (selectedModel) {
                    console.log(`🤖 使用指定模型: ${selectedModel}`);
                }

                // 确定最终使用的系统提示（优先使用自定义，否则使用 Firebase 默认）
                const finalSystemPrompt = systemPromptOverride || customSystemPrompt;

        // 生成故事
        const generateResponse = await aiService.generateMultiCharacterStory({
            sessionId: session.id,
            currentContext: script.故事内容,
                    userChoice: normalizedUserChoice,
            participatingCharacters,
                    systemPrompt: finalSystemPrompt,
            temperature: 0.7,
            maxTokens: 2000,
                    model: selectedModel,  // 传入选择的模型
                    scriptType: promptType,  // 传入脚本类型用于响应格式解析
                }, finalSystemPrompt, customUserPrompt);

                // 替换故事中的角色变量
                const narrativeWithReplacedVariables = scriptService.replaceCharacterVariables(
                    generateResponse.narrative,
                    participatingCharacters
                );

                // 记录AI的回复（包含系统提示和用户提示用于调试）
        const aiResponse: DialogueEntry = {
            id: uuidv4(),
            roleId: 'narrator',
            userAICharacterId: 'narrator',
            userAICharacterName: '叙述者',
            scriptCharacterName: '叙述者',
                    content: narrativeWithReplacedVariables,
            type: 'ai-response',
            timestamp: new Date(),
            modelUsed: generateResponse.modelUsed,
                    // 添加调试信息
                    systemPrompt: finalSystemPrompt,
                    userPrompt: customUserPrompt,
        };
        session.dialogueHistory.push(aiResponse);

        // 更新会话
        session.currentChoicePoint = generateResponse.nextChoicePoint;
        session.updatedAt = new Date();
        session.choiceHistory.push({
            选择点ID: choiceId,
                    选择的选项: normalizedUserChoice,
            时间戳: new Date(),
        });

        sessions.set(sessionId, session);

                // 替换选项中的角色变量
                const replacedOptions = generateResponse.newOptions.map((opt: any) => ({
                    ...opt,
                    文本: scriptService.replaceCharacterVariables(opt.文本, participatingCharacters),
                    后果描述: scriptService.replaceCharacterVariables(opt.后果描述, participatingCharacters),
                }));

                console.log(`✅ 故事生成完成，通过 WebSocket 发送给前端`);

                // 通过 WebSocket 发送生成的故事给前端
                const wsMessage = {
                    type: 'story_generated',
                    success: true,
                    data: {
                        narrative: narrativeWithReplacedVariables,
                        choicePoint: generateResponse.nextChoicePoint,
                        options: replacedOptions,
                        characterResponses: generateResponse.characterResponses,
                        dialogueHistory: session.dialogueHistory,
                        modelUsed: generateResponse.modelUsed,
                        generationTime: generateResponse.generationTime,
                    },
                };

                console.log(`📤 发送 WebSocket 消息结构:`, {
                    type: wsMessage.type,
                    success: wsMessage.success,
                    hasData: !!wsMessage.data,
                    dataKeys: wsMessage.data ? Object.keys(wsMessage.data) : [],
                });

                broadcastToSession(sessionId, wsMessage);
            } catch (error) {
                console.error('❌ 异步生成故事失败:', error);
                // 通过 WebSocket 发送错误给前端
                broadcastToSession(sessionId, {
                    type: 'story_error',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        })();
    } catch (error) {
        console.error('Game error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取会话的对话历史
 * GET /api/game/sessions/:sessionId/history
 */
router.get('/sessions/:sessionId/history', (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
            });
        }

        res.json({
            success: true,
            data: session.dialogueHistory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * 获取系统提示模板
 * GET /api/game/sessions/:sessionId/system-prompt?scriptId=xxx
 * 或者
 * GET /api/game/scripts/:scriptId/system-prompt
 */
router.get('/sessions/:sessionId/system-prompt', async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { scriptId: queryScriptId } = req.query;

    try {
        let scriptId = queryScriptId as string;

        // 如果没有提供 scriptId，尝试从 sessions 映射获取
        if (!scriptId) {
            const session = sessions.get(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Game session not found',
                });
            }
            scriptId = session.scriptId;
        }

        // 获取剧本
        const script = await scriptService.getScriptById(scriptId);
        if (!script) {
            return res.status(404).json({
                success: false,
                error: 'Script not found',
            });
        }

        // 确定提示类型（根据剧本类别）
        let promptType = 'single-single-sp'; // 默认值
        if (script.剧本类别.includes('【多人】') && script.剧本类别.includes('【多AI】')) {
            promptType = 'multi-multi-sp';
        } else if (script.剧本类别.includes('【单人】') && script.剧本类别.includes('【多AI】')) {
            promptType = 'single-multi-sp';
        }

        // 获取系统提示模板
        const systemPrompt = await scriptService.getSystemPromptTemplate(promptType);

        res.json({
            success: true,
            data: {
                systemPrompt,
                promptType,
            },
        });
    } catch (error) {
        console.error('获取系统提示失败:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
