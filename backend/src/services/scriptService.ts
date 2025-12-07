import { Script, ScriptCharacter, ScriptCharacterDetail } from '../types';
import { db } from '../config/firebase';

export class ScriptService {
    private firebaseInitialized = false;

    constructor() {
        // 所有数据从 Firebase 读取
    }

    /**
     * 检测文本中的角色变量 ({{角色A}}, {{角色B}} 等)
     * @param text 要检测的文本
     * @returns 找到的所有角色变量，如 ['角色A', '角色B']
     */
    detectCharacterVariables(text: string): string[] {
        if (!text) return [];

        const regex = /{{(角色[A-Za-z0-9]+)}}/g;
        const matches: string[] = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1]);
            }
        }

        return matches;
    }

    /**
     * 检测剧本中的所有角色变量
     * 需要检测角色网络节点、角色池、角色详细设定中的所有文本字段
     * @param script 剧本对象
     * @returns 找到的所有角色变量及其对应的索引，如 { 角色A: 0, 角色B: 1 }
     */
    detectScriptCharacterVariables(script: Script): { [key: string]: number } {
        const variables: { [key: string]: number } = {};
        const characterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        // 检测所有角色池中的文本
        if (script.角色池) {
            script.角色池.forEach((role) => {
                const textToCheck = JSON.stringify(role);
                const found = this.detectCharacterVariables(textToCheck);
                found.forEach((varName) => {
                    if (!variables.hasOwnProperty(varName)) {
                        // 按照 A、B、C 的顺序索引
                        const index = characterLabels.indexOf(varName.substring(2));
                        if (index !== -1) {
                            variables[varName] = index;
                        }
                    }
                });
            });
        }

        // 检测所有角色详细设定中的文本
        if (script.角色详细设定) {
            script.角色详细设定.forEach((detail) => {
                const textToCheck = JSON.stringify(detail);
                const found = this.detectCharacterVariables(textToCheck);
                found.forEach((varName) => {
                    if (!variables.hasOwnProperty(varName)) {
                        const index = characterLabels.indexOf(varName.substring(2));
                        if (index !== -1) {
                            variables[varName] = index;
                        }
                    }
                });
            });
        }

        return variables;
    }

    /**
     * 替换故事中的角色变量 ({{角色A}}, {{角色B}} 等)
     * @param text 原始文本
     * @param characterMappings 角色映射信息，格式为 { roleId: { AI角色名 } }
     * @returns 替换后的文本
     */
    replaceCharacterVariables(text: string, characterMappings: Array<{ scriptRoleId?: string; userAICharacterName?: string; userAICharacter?: any }>): string {
        if (!text || !characterMappings || characterMappings.length === 0) {
            return text;
        }

        let result = text;

        const characterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        // 先按 scriptRoleId 精确替换（支持 {{角色A}}、{{角色B}} 等变量）
        characterMappings.forEach((mapping, index) => {
            const characterName = mapping.userAICharacterName ||
                mapping.userAICharacter?.姓名 ||
                `角色${index + 1}`;

            if (mapping.scriptRoleId) {
                const placeholderRegex = new RegExp(`{{${mapping.scriptRoleId}}}`, 'g');
                result = result.replace(placeholderRegex, characterName);

                const labelMatch = mapping.scriptRoleId.match(/^角色([A-Z])$/);
                if (labelMatch) {
                    const label = labelMatch[1];
                    const labelRegex = new RegExp(`{{角色${label}}}`, 'g');
                    result = result.replace(labelRegex, characterName);
                }
            }
        });

        // 兼容旧格式：根据顺序替换 {{角色A}}、{{角色B}} ...
        characterLabels.forEach((label, index) => {
            if (index < characterMappings.length) {
                const mapping = characterMappings[index];
                const characterName = mapping.userAICharacterName ||
                    mapping.userAICharacter?.姓名 ||
                    `角色${label}`;
                const regex = new RegExp(`{{角色${label}}}`, 'g');
                result = result.replace(regex, characterName);
            }
        });

        // 也替换 {{角色0}}、{{角色1}} 这种数字形式
        characterMappings.forEach((mapping, index) => {
            const characterName = mapping.userAICharacterName ||
                mapping.userAICharacter?.姓名 ||
                `角色${index}`;
            const regex = new RegExp(`{{角色${index}}}`, 'g');
            result = result.replace(regex, characterName);
        });

        return result;
    }

    /**
     * 从 Firebase Prompts 集合获取 system prompt 模板
     * @param scriptType 脚本类型：'single-single-sp', 'single-multi-sp', 'multi-multi-sp'
     * @returns 返回 system prompt 文本
     */
    async getSystemPromptTemplate(scriptType: string): Promise<string> {
        console.log(`📋 从 Prompts.livestory 获取 system prompt: ${scriptType}`);

        const doc = await db.collection('Prompts').doc('livestory').get();

        if (!doc.exists) {
            console.error(`❌ Prompts 集合中找不到 livestory 文档`);
            throw new Error(`Livestory document not found in Prompts collection`);
        }

        const data = doc.data();
        const systemPrompt = data?.[scriptType] || '';

        if (!systemPrompt) {
            console.error(`❌ Prompts.livestory 文档中找不到字段: ${scriptType}`);
            throw new Error(`System prompt field not found in Prompts.livestory for type: ${scriptType}`);
        }

        console.log(`✅ 成功获取 system prompt 模板: ${scriptType}`);
        return systemPrompt;
    }


    /**
     * 从 Firebase Prompts.livestory 文档获取角色设定模板
     * @param scriptType 脚本类型（single-single-sp、single-multi-sp、multi-multi-sp）
     * @returns 角色设定模板字符串
     */
    async getCharacterTemplate(scriptType: string): Promise<string> {
        console.log(`📋 从 Firebase Prompts.livestory.character 获取角色设定模板`);

        const doc = await db.collection('Prompts').doc('livestory').get();

        if (!doc.exists) {
            console.error(`❌ Prompts 集合中找不到 livestory 文档`);
            throw new Error(`Character template document not found in Prompts collection`);
        }

        const data = doc.data();
        const characterTemplate = data?.character || '';

        if (!characterTemplate) {
            console.error(`❌ Prompts.livestory 文档中找不到 character 字段`);
            throw new Error(`Character field not found in Prompts.livestory document`);
        }

        console.log(`✅ 成功从 Prompts.livestory 获取角色设定模板`);
        return characterTemplate;
    }

    /**
     * 从 Firebase Prompts.livestory 文档获取用户提示模板
     * @param scriptType 脚本类型：'single-single-up', 'single-multi-up', 'multi-multi-up'
     * @returns 用户提示文本
     */
    async getUserPromptTemplate(scriptType: string): Promise<string> {
        console.log(`📋 从 Prompts.livestory 获取 user prompt: ${scriptType}`);

        const doc = await db.collection('Prompts').doc('livestory').get();

        if (!doc.exists) {
            console.error(`❌ Prompts 集合中找不到 livestory 文档`);
            throw new Error(`Livestory document not found in Prompts collection`);
        }

        const data = doc.data();
        const userPrompt = data?.[scriptType] || '';

        if (!userPrompt) {
            console.error(`❌ Prompts.livestory 文档中找不到字段: ${scriptType}`);
            throw new Error(`User prompt field not found in Prompts.livestory for type: ${scriptType}`);
        }

        console.log(`✅ 成功获取 user prompt 模板: ${scriptType}`);
        return userPrompt;
    }

    /**
     * 替换 system prompt 中的模板变量
     * @param template system prompt 模板
     * @param replacements 替换值，格式为 { 变量名: 值 }
     * @returns 替换后的 system prompt
     */
    replacePromptTemplate(template: string, replacements: { [key: string]: string }): string {
        let result = template;

        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        }

        return result;
    }

    /**
     * 构建角色设定文本 - 为单个角色生成详细描述
     * @param characterTemplate 角色设定模板
     * @param aiCharacter AI 角色信息（来自 livestory 集合）
     * @param scriptCharacter 脚本角色信息
     * @param roleDetail 角色详细设定
     * @returns 替换后的角色设定文本
     */
    buildCharacterDescription(
        characterTemplate: string,
        aiCharacter: any,
        scriptCharacter: any,
        roleDetail: any
    ): string {
        const characterReplacements: { [key: string]: string } = {
            // 从 AI 角色信息 - 使用 mapFirebaseCharacter 映射后的中文字段
            '姓名': aiCharacter?.姓名 || '未知角色',
            '年龄': String(aiCharacter?.年龄 || '未知'),
            '国籍': aiCharacter?.国籍 || '未知',
            '星座': aiCharacter?.星座 || '未知',
            'MBTI': aiCharacter?.MBTI || '未知',
            '和用户的身份': aiCharacter?.和用户的身份 || '陌生人',
            '外貌描述': aiCharacter?.外貌描述 || '普通外表',
            '面对未知的态度': aiCharacter?.面对未知的态度 || '谨慎',
            '恐惧/软肋': aiCharacter?.恐惧软肋 || '未知',
            '喜好/特长': Array.isArray(aiCharacter?.喜好特长) 
                ? aiCharacter.喜好特长.join('、') 
                : '未知',
            '讨厌的东西': Array.isArray(aiCharacter?.讨厌的东西) 
                ? aiCharacter.讨厌的东西.join('、') 
                : '未知',

            // 超能力处理 - 映射后是数组
            '超能力': Array.isArray(aiCharacter?.超能力) && aiCharacter.超能力.length > 0
                ? aiCharacter.超能力.map((p: any) => p.名称).join('、')
                : '无',
            '等级': Array.isArray(aiCharacter?.超能力) && aiCharacter.超能力.length > 0
                ? aiCharacter.超能力.map((p: any) => String(p.等级 || 0)).join('、')
                : '无',

            // 从脚本角色信息
            '角色简介': roleDetail?.角色简介 || scriptCharacter?.角色简介 || '暂无介绍',
            '角色目标': scriptCharacter?.角色目标 || roleDetail?.角色目标 || '未知',
        };

        let result = characterTemplate;
        for (const [key, value] of Object.entries(characterReplacements)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        }

        return result;
    }



    /**
     * 获取所有剧本
     */
    async getAllScripts(): Promise<Script[]> {
        console.log(`📖 从 Firebase 读取所有剧本`);

        // 从 Firebase 读取
            const snapshot = await db.collection('livestory-story').get();

            if (!snapshot.empty) {
                console.log(`📖 从 Firebase 读取 ${snapshot.size} 个剧本`);
            const scripts = this.mapFirebaseScripts(snapshot);
            console.log(`✅ 成功映射 ${scripts.length} 个剧本`);
            return scripts;
            } else {
            console.warn('⚠️  Firebase 中没有剧本数据');
            return [];
        }
    }

    /**
     * 按分类获取剧本
     */
    async getScriptsByCategory(category: string): Promise<Script[]> {
        console.log(`📖 从 Firebase 按类别 ${category} 读取剧本`);

        // 从 Firebase 读取
            const snapshot = await db
                .collection('livestory-story')
                .where('剧本类别', '==', category)
                .get();

            if (!snapshot.empty) {
                console.log(`📖 从 Firebase 按类别 ${category} 读取 ${snapshot.size} 个剧本`);
                return this.mapFirebaseScripts(snapshot);
            } else {
            console.warn(`⚠️  Firebase 中没有 ${category} 类别的剧本`);
            return [];
        }
    }

    /**
     * 获取单个剧本
     */
    async getScriptById(scriptId: string): Promise<Script | undefined> {
        console.log(`🔍 [getScriptById] 正在查询剧本: ${scriptId}`);

        // 从 Firebase 读取
            const doc = await db.collection('livestory-story').doc(scriptId).get();

            if (doc.exists) {
            console.log(`✅ [getScriptById] 找到剧本 ${scriptId}`);
                return this.mapFirebaseScript(doc);
            } else {
            console.error(`❌ [getScriptById] Firebase 中找不到剧本 ${scriptId}`);
            return undefined;
        }
    }

    /**
     * 获取剧本的角色列表
     */
    async getScriptCharacters(scriptId: string): Promise<ScriptCharacter[]> {
        const script = await this.getScriptById(scriptId);
        return script?.角色池 || [];
    }

    // ===== Firebase 映射方法 =====

    /**
     * 映射单个 Firebase 文档为 Script
     */
    private mapFirebaseScript(doc: any): Script {
        const data = doc.data();

        console.log('📖 [mapFirebaseScript] 映射剧本:', doc.id);
        console.log('  📋 Firebase 文档的所有字段:', Object.keys(data));

        // 🔍 获取角色详细设定 - 可能是对象格式 {"{{角色名}}": {...}} 或数组格式
        let roleDetailsMap: { [key: string]: any } = {};
        const rawRoleDetails = data.角色详细设定;
        
        if (rawRoleDetails && typeof rawRoleDetails === 'object' && !Array.isArray(rawRoleDetails)) {
            // 对象格式：{"{{AI修复师}}": {...}, "{{竞争对手}}": {...}}
            console.log('  📋 角色详细设定是对象格式，key 数量:', Object.keys(rawRoleDetails).length);
            roleDetailsMap = rawRoleDetails;
        } else if (Array.isArray(rawRoleDetails)) {
            // 数组格式：[{roleId: "...", ...}, ...]
            console.log('  📋 角色详细设定是数组格式，长度:', rawRoleDetails.length);
            rawRoleDetails.forEach((detail: any) => {
                if (detail.roleId) {
                    roleDetailsMap[detail.roleId] = detail;
                }
            });
        }

        // 🔍 获取角色数据 - 优先从角色网络.节点获取
        let rolePoolData: any[] = [];
        const networkNodes = data.角色网络?.节点;
        
        if (Array.isArray(networkNodes) && networkNodes.length > 0) {
            console.log('  📋 从角色网络.节点构建角色池:', networkNodes);
            
            rolePoolData = networkNodes.map((node: any, index: number) => {
                // 节点可能是字符串 "{{AI修复师}}" 或对象
                let roleName = typeof node === 'string' ? node : (node.姓名 || node.name || `角色${index + 1}`);
                // 去掉 {{ }} 包裹
                const cleanName = roleName.replace(/^\{\{|\}\}$/g, '');
                const roleKey = roleName; // 保留原始 key 用于查找详细设定
                
                // 从 roleDetailsMap 中获取详细设定
                const detail = roleDetailsMap[roleKey] || roleDetailsMap[cleanName] || {};
                
                return {
                    id: `role-${doc.id}-${index}`,
                    roleId: cleanName,
                    姓名: cleanName,
                    角色简介: detail.角色简介 || '',
                    角色目标: detail.角色目标 || '',
                    角色视角的故事背景: detail.角色视角的故事背景 || '',
                    第一个选择点: detail.第一个选择点 || '',
                    预置策略选项: Array.isArray(detail.预置策略选项) ? detail.预置策略选项 : [],
                };
            });
        } else if (data.角色池 && Array.isArray(data.角色池)) {
            // 使用原始角色池数据
            rolePoolData = data.角色池;
        }

        // ✨ 检测剧本中是否使用了角色变量（如 {{角色A}}, {{角色B}}）
        const scriptText = JSON.stringify(data);
        const characterVariables = this.detectCharacterVariables(scriptText);

        // 如果检测到角色变量，为每个变量创建一个虚拟角色池条目
        if (characterVariables.length > 0) {
            console.log(`  🎭 检测到角色变量: ${characterVariables.join(', ')}`);
            
            // 确保 rolePoolData 是数组
            if (!Array.isArray(rolePoolData)) {
                rolePoolData = [];
            }
            
            // 为每个变量生成角色条目（如果 rolePoolData 里还没有）
            characterVariables.forEach((varName) => {
                const existingRole = rolePoolData.find((r: any) => r.roleId === varName || r.姓名 === varName);
                if (!existingRole) {
                    console.log(`  ➕ 为变量 ${varName} 创建角色条目`);
                    const detail = roleDetailsMap[`{{${varName}}}`] || roleDetailsMap[varName] || {};
                    rolePoolData.push({
                        id: varName,
                        roleId: varName,
                        姓名: varName,
                        角色简介: detail.角色简介 || `剧本中的 ${varName} 变量角色`,
                        角色目标: detail.角色目标 || '',
                        角色视角的故事背景: detail.角色视角的故事背景 || data.角色视角的故事背景 || '',
                        第一个选择点: detail.第一个选择点 || data.第一个选择点 || '',
                        预置策略选项: Array.isArray(detail.预置策略选项) ? detail.预置策略选项 : [],
                    });
                }
            });
        }

        // 如果没有角色池数据，则将文档本身作为一个角色使用（针对单角色结构）
        if (!rolePoolData || rolePoolData.length === 0) {
            console.log('  ⚠️ 没有找到角色池或角色网络.节点，使用文档本身作为角色数据');

            const fallbackRoleId = 'player-role-0';
            rolePoolData = [{
                id: fallbackRoleId,
                roleId: fallbackRoleId,
                姓名: data.主角名称 || '主角',
                角色简介: '故事的主角',
                角色目标: '',
                角色视角的故事背景: data.角色视角的故事背景 || '',
                第一个选择点: data.第一个选择点 || '',
                预置策略选项: Array.isArray(data.预置策略选项) ? data.预置策略选项 : [],
            }];
        }

        // 🔍 构建角色详细设定数组
        let roleDetailsData: any[] = [];
        
        // 从 roleDetailsMap 或 rolePoolData 构建
        if (Object.keys(roleDetailsMap).length > 0) {
            roleDetailsData = Object.entries(roleDetailsMap).map(([key, detail]: [string, any], index) => {
                const cleanName = key.replace(/^\{\{|\}\}$/g, '');
                return {
                    roleId: cleanName,
                    角色简介: detail.角色简介 || '',
                    角色目标: detail.角色目标 || '',
                    角色视角的故事背景: detail.角色视角的故事背景 || '',
                    第一个选择点: detail.第一个选择点 || '',
                    预置策略选项: Array.isArray(detail.预置策略选项) ? detail.预置策略选项 : [],
                };
            });
        } else if (rolePoolData && rolePoolData.length > 0) {
            // 基于角色池构造
            roleDetailsData = rolePoolData.map((char: any, index: number) => ({
                roleId: char.roleId || char.id || `role-${doc.id}-${index}`,
                角色简介: char.角色简介 || '故事的主角',
                角色目标: char.角色目标 || '',
                角色视角的故事背景: char.角色视角的故事背景 || data.角色视角的故事背景 || '',
                第一个选择点: char.第一个选择点 || data.第一个选择点 || '',
                预置策略选项: Array.isArray(char.预置策略选项) ? char.预置策略选项 : [],
            }));
        }

        // 如果依然没有，最后再以文档自身作为单个角色详设
        if (!roleDetailsData || roleDetailsData.length === 0) {
            console.log('  ⚠️ 仍然没有角色详细设定，使用文档本身作为角色详细设定');
            const fallbackRoleId = 'player-role-0';
            roleDetailsData = [{
                roleId: fallbackRoleId,
                角色简介: '故事的主角',
                角色目标: '',
                角色视角的故事背景: data.角色视角的故事背景 || '',
                第一个选择点: data.第一个选择点 || '',
                预置策略选项: Array.isArray(data.预置策略选项) ? data.预置策略选项 : [],
            }];
        }

        const result = {
            id: doc.id,
            剧本类别: data.剧本类别,
            品类标签: Array.isArray(data.品类标签) ? data.品类标签 : [],
            参与AI数: data['参与AI数'] || 1,
            剧本简介: data.剧本简介,
            剧本封面: data.剧本封面,
            故事内容: data.故事内容,
            角色池: this.mapCharacterPool(rolePoolData || []),
            角色详细设定: this.mapCharacterDetails(roleDetailsData || []),
            预计时长: data.预计时长 || 30,
            难度: data.难度 || 'normal',
            创建时间: data.创建时间 ? new Date(data.创建时间.toDate?.() || data.创建时间) : new Date(),
            更新时间: data.更新时间 ? new Date(data.更新时间.toDate?.() || data.更新时间) : new Date(),
            // 添加额外字段供前端使用
            title: data.剧本名 || data.剧本标题 || data.标题 || '未命名剧本',
            description: data.简介 || data.剧本简介?.substring(0, 50),
        } as any;

        console.log('✅ [mapFirebaseScript] 映射完成:', {
            id: result.id,
            角色池数: result.角色池.length,
            角色详设数: result.角色详细设定.length,
        });

        return result;
    }

    /**
     * 映射多个 Firebase 文档为 Script[]
     */
    private mapFirebaseScripts(snapshot: any): Script[] {
        const scripts: Script[] = [];
        snapshot.forEach((doc: any) => {
            scripts.push(this.mapFirebaseScript(doc));
        });
        return scripts;
    }

    /**
     * 映射角色池
     */
    private mapCharacterPool(pool: any[]): ScriptCharacter[] {
        if (!Array.isArray(pool)) {
            console.warn('⚠️ 角色池不是数组，返回空数组');
            return [];
        }
        const timestamp = Date.now();
        return pool.map((char, index) => ({
            id: char.id || `role-${timestamp}-${index}`,
            roleId: char.roleId || char.id || `role-${timestamp}-${index}`,
            姓名: char.姓名 || char.name,
            角色简介: char.角色简介 || '',
            角色目标: char.角色目标 || '',
            角色视角的故事背景: char.角色视角的故事背景 || '',
            第一个选择点: char.第一个选择点 || '',
            预置策略选项: (char.预置策略选项 || []).map((opt: any, optIndex: number) => ({
                id: opt.id || `option-${timestamp}-${index}-${optIndex}`,
                文本: opt.文本 || opt.text,
                后果描述: opt.后果描述 || opt.consequence,
                推荐AI特征: opt.推荐AI特征 || [],
            })),
        }));
    }

    /**
     * 映射角色详细设定
     */
    private mapCharacterDetails(details: any[]): ScriptCharacterDetail[] {
        if (!Array.isArray(details)) {
            console.warn('⚠️ 角色详细设定不是数组，返回空数组');
            return [];
        }
        const timestamp = Date.now();
        return details.map((detail, index: number) => {
            // 减少日志输出以降低内存占用
            // console.log('📋 原始 detail 对象:', JSON.stringify(detail, null, 2));
            // console.log('📋 预置策略选项类型:', typeof detail.预置策略选项);
            // console.log('📋 预置策略选项值:', JSON.stringify(detail.预置策略选项, null, 2));

            // 如果预置策略选项不是数组，可能是对象，需要转换
            let optionsArray = detail.预置策略选项 || [];
            if (optionsArray && typeof optionsArray === 'object' && !Array.isArray(optionsArray)) {
                // 如果是对象，转换为数组
                console.log('⚠️ 预置策略选项是对象，尝试转换为数组');
                optionsArray = Object.values(optionsArray);
            }

            return {
                roleId: detail.roleId || detail.id || `role-${timestamp}-${index}`,
            角色简介: detail.角色简介,
            角色目标: detail.角色目标,
            角色视角的故事背景: detail.角色视角的故事背景,
            第一个选择点: detail.第一个选择点,
                预置策略选项: (Array.isArray(optionsArray) ? optionsArray : []).map((opt: any, optIndex: number) => {
                    // 处理两种格式：
                    // 1. 对象格式：{ 文本: '...', 后果描述: '...', ... }
                    // 2. 字符串格式：'选项文本'
                    if (typeof opt === 'string') {
                        return {
                            id: `option-${timestamp}-${index}-${optIndex}`,
                            文本: opt,
                            后果描述: '',
                            推荐AI特征: [],
                        };
                    } else if (typeof opt === 'object') {
                        return {
                            id: opt.id || `option-${timestamp}-${index}-${optIndex}`,
                            文本: opt.文本 || opt.text || `选项 ${optIndex + 1}`,
                            后果描述: opt.后果描述 || opt.consequence || '',
                推荐AI特征: opt.推荐AI特征 || [],
                        };
                    }
                    return {
                        id: `option-${timestamp}-${index}-${optIndex}`,
                        文本: `选项 ${optIndex + 1}`,
                        后果描述: '',
                        推荐AI特征: [],
                    };
                }),
            };
        });
    }
}

export const scriptService = new ScriptService();
