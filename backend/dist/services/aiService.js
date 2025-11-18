"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
class AIService {
    constructor() {
        this.openrouterBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.openrouterApiKey = process.env.OPENROUTER_API_KEY || '';
        console.log(`🔑 AIService 初始化，API Key: ${this.openrouterApiKey ? '✅ 已配置' : '❌ 未配置'}`);
    }
    /**
     * 生成多角色故事
     */
    async generateMultiCharacterStory(request, customSystemPrompt, customUserPrompt) {
        // 使用传入的自定义 system prompt，或者构建默认的
        const systemPrompt = customSystemPrompt || this.buildMultiCharacterPrompt(request);
        const userPrompt = customUserPrompt || this.buildUserPrompt(request);
        const startTime = Date.now();
        try {
            // 如果没有配置 API 密钥，使用演示响应
            if (!this.openrouterApiKey) {
                console.warn('⚠️ OPENROUTER_API_KEY 未配置，使用演示响应');
                return this.generateDemoResponse(request);
            }
            const response = await this.callOpenRouter('openai/gpt-5.1-chat', [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ], request.temperature || 0.7, request.maxTokens || 2000);
            const generationTime = Date.now() - startTime;
            const parsed = this.parseMultiCharacterResponse(response.content, request.scriptType);
            return {
                narrative: parsed.narrative,
                nextChoicePoint: parsed.nextChoicePoint,
                newOptions: parsed.options,
                characterResponses: parsed.characterResponses,
                modelUsed: 'openai/gpt-5.1-chat',
                generationTime,
            };
        }
        catch (error) {
            console.error('Generation error:', error);
            throw error;
        }
    }
    /**
     * 构建多角色系统提示
     */
    buildMultiCharacterPrompt(request) {
        const characterDescriptions = request.participatingCharacters
            .map((pc) => {
            const ua = pc.userAICharacter || {};
            const sc = pc.scriptCharacter || {};
            const rd = pc.roleDetail || {};
            return `
【${ua.姓名 || '角色'} - 扮演 ${sc.姓名 || '角色'}】
用户AI角色信息：
|- 身份：${ua.和用户的身份 || '未知'}
|- MBTI：${ua.MBTI || 'INFP'}
|- 性格特征：${Array.isArray(ua.喜好特长) ? ua.喜好特长.join('、') : ''}
|- 讨厌的东西：${Array.isArray(ua.讨厌的东西) ? ua.讨厌的东西.join('、') : ''}
|- 面对未知：${ua.面对未知的态度 || '未知'}
|- 恐惧软肋：${ua.恐惧软肋 || '未知'}

剧本角色要求：
|- 角色目标：${sc.角色目标 || ''}
|- 背景故事：${rd.角色视角的故事背景 || ''}
|- 性格描述：${rd.角色简介 || ''}
`;
        })
            .join('\n');
        return `你是一个多角色互动故事生成器。

【故事背景】
${request.currentContext}

【参与的角色】
${characterDescriptions}

【你的任务】
1. 根据用户的选择，生成故事的下一段（2-3段）
2. 让每个角色用自己独特的方式做出反应和行动
3. 考虑角色的MBTI、个性特征、目标、恐惧等
4. 生成下一个选择点（关键的决策时刻）
5. 生成3个新的策略选项，每个选项应该反映不同的角色思路

【返回格式 - JSON】
必须返回以下JSON结构，不要包含其他内容：
{
  "narrative": "故事叙述段落（2-3段），描述场景发展和冲突",
  "characterResponses": [
    {"characterName": "角色名", "response": "该角色的反应和行动（1-2句）"},
    {"characterName": "另一个角色名", "response": "该角色的反应和行动（1-2句）"}
  ],
  "nextChoicePoint": "下一个关键决策点的描述（玩家需要做出选择）",
  "options": [
    {
      "id": "opt-1",
      "文本": "第一个选项的描述（短且清晰）",
      "后果描述": "简短描述选择的后果"
    },
    {
      "id": "opt-2",
      "文本": "第二个选项的描述",
      "后果描述": "简短描述选择的后果"
    },
    {
      "id": "opt-3",
      "文本": "第三个选项的描述",
      "后果描述": "简短描述选择的后果"
    }
  ]
}`;
    }
    /**
     * 构建用户提示
     */
    buildUserPrompt(request) {
        return `用户选择了：${request.userChoice}

请根据这个选择生成故事的下一步，确保每个参与的角色都有合理的反应。`;
    }
    /**
     * 调用 OpenRouter API
     */
    async callOpenRouter(modelId, messages, temperature, maxTokens) {
        try {
            const response = await axios_1.default.post(this.openrouterBaseUrl, {
                model: modelId,
                messages,
                temperature,
                max_tokens: maxTokens,
            }, {
                headers: {
                    Authorization: `Bearer ${this.openrouterApiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://drama-game.ai',
                    'X-Title': 'AI Interactive Drama Game',
                },
            });
            return {
                content: response.data.choices[0]?.message?.content || '',
                tokens: response.data.usage?.total_tokens || 0,
            };
        }
        catch (error) {
            console.error('OpenRouter API error:', error);
            throw error;
        }
    }
    /**
     * 生成演示响应（当没有配置 API 密钥时使用）
     */
    generateDemoResponse(request) {
        const demoNarratives = [
            `根据你的选择，故事向前发展。你的决定引发了一系列连锁反应。参与的角色们各自开始了他们的行动...`,
            `时间在悄悄流逝。你的选择影响了剧情的走向。周围的环境随之改变，新的机遇和挑战接踵而至...`,
            `你的决定得到了意想不到的回应。故事变得更加复杂起来，众多角色开始相互作用...`,
        ];
        const demoChoices = [
            { id: 'choice-1', text: '继续坚持你的决定', 文本: '继续坚持你的决定', consequence: '看看这会带来什么后果', 后果描述: '看看这会带来什么后果' },
            { id: 'choice-2', text: '改变策略', 文本: '改变策略', consequence: '尝试不同的方法', 后果描述: '尝试不同的方法' },
            { id: 'choice-3', text: '寻求其他角色的帮助', 文本: '寻求其他角色的帮助', consequence: '与他人合作解决问题', 后果描述: '与他人合作解决问题' },
        ];
        const randomNarrative = demoNarratives[Math.floor(Math.random() * demoNarratives.length)];
        return {
            narrative: randomNarrative,
            nextChoicePoint: '故事继续发展，你面临新的选择...',
            newOptions: demoChoices,
            characterResponses: request.participatingCharacters.map((char) => ({
                characterId: char.scriptCharacter?.roleId || 'unknown',
                characterName: char.scriptCharacter?.姓名 || '角色',
                response: `${char.scriptCharacter?.姓名}根据你的选择做出了反应...`,
            })),
            modelUsed: 'demo-mode',
            generationTime: 500,
        };
    }
    /**
     * 解析多角色响应 - 支持多种格式
     * single-single-sp/single-multi-sp 格式:
     * {
     *   "剧情发展": "...",
     *   "抉择时刻": {
     *     "情境描述": "...",
     *     "选项": { "A": "...", "B": "...", "C": "..." }
     *   }
     * }
     *
     * multi-multi-sp 格式:
     * {
     *   "剧情发展": "...",
     *   "角色抉择列表": [{
     *     "角色名": "...",
     *     "情境描述": "...",
     *     "选项": { "A": "...", "B": "...", "C": "..." }
     *   }]
     * }
     */
    parseMultiCharacterResponse(content, scriptType) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            // 判断是多人多AI格式还是其他格式
            if (parsed.角色抉择列表 && Array.isArray(parsed.角色抉择列表)) {
                // multi-multi-sp 格式
                console.log('📊 检测到 multi-multi-sp 格式响应');
                const narrative = parsed.剧情发展 || '故事继续发展...';
                // 获取第一个角色的抉择作为主要选项
                const firstCharacterChoice = parsed.角色抉择列表[0] || {};
                const choiceOptions = firstCharacterChoice.选项 || { A: '', B: '', C: '' };
                const options = [
                    { id: 'opt-A', text: choiceOptions.A || '选项A', 文本: choiceOptions.A || '选项A', 后果描述: '', consequence: '' },
                    { id: 'opt-B', text: choiceOptions.B || '选项B', 文本: choiceOptions.B || '选项B', 后果描述: '', consequence: '' },
                    { id: 'opt-C', text: choiceOptions.C || '选项C', 文本: choiceOptions.C || '选项C', 后果描述: '', consequence: '' },
                ];
                return {
                    narrative,
                    nextChoicePoint: firstCharacterChoice.情境描述 || '接下来你该做什么？',
                    options,
                    characterResponses: parsed.角色抉择列表.map((char, index) => ({
                        characterId: `char-${index}`,
                        characterName: char.角色名 || `角色${index + 1}`,
                        response: `${char.情境描述}`,
                    })) || [],
                };
            }
            else {
                // single-single-sp / single-multi-sp 格式
                console.log('📊 检测到 single-sp 格式响应');
                const narrative = parsed.剧情发展 || '故事继续发展...';
                const choiceInfo = parsed.抉择时刻 || {};
                const choiceOptions = choiceInfo.选项 || { A: '', B: '', C: '' };
                const options = [
                    { id: 'opt-A', text: choiceOptions.A || '选项A', 文本: choiceOptions.A || '选项A', 后果描述: '', consequence: '' },
                    { id: 'opt-B', text: choiceOptions.B || '选项B', 文本: choiceOptions.B || '选项B', 后果描述: '', consequence: '' },
                    { id: 'opt-C', text: choiceOptions.C || '选项C', 文本: choiceOptions.C || '选项C', 后果描述: '', consequence: '' },
                ];
                return {
                    narrative,
                    nextChoicePoint: choiceInfo.情境描述 || '接下来你该做什么？',
                    options,
                    characterResponses: [],
                };
            }
        }
        catch (error) {
            console.error('❌ Parse error:', error);
            console.error('❌ 原始响应:', content.substring(0, 200));
            // 返回默认结构
            return {
                narrative: content,
                nextChoicePoint: '接下来你该做什么？',
                options: [
                    { id: 'opt-1', 文本: '继续前进', 后果描述: '看看会发生什么' },
                    { id: 'opt-2', 文本: '谨慎行动', 后果描述: '评估情况' },
                    { id: 'opt-3', 文本: '请求帮助', 后果描述: '寻求支持' },
                ],
                characterResponses: [],
            };
        }
    }
    /**
     * 调试模式：测试单个提示词
     */
    async debugPrompt(prompt, model = 'openai/gpt-5.1-chat', temperature = 0.7) {
        const startTime = Date.now();
        try {
            const result = await this.callOpenRouter(model, [
                {
                    role: 'user',
                    content: prompt,
                },
            ], temperature, 1000);
            const timestamp = Date.now() - startTime;
            return {
                id: `debug-${Date.now()}`,
                prompt,
                response: result.content,
                model,
                timestamp: new Date(),
                tokens: {
                    input: 0,
                    output: result.tokens,
                },
            };
        }
        catch (error) {
            console.error('Debug prompt error:', error);
            throw new Error('Failed to debug prompt');
        }
    }
    /**
     * 对比模式：同时测试多个模型
     */
    async compareModels(prompt, models = [
        'openai/gpt-5.1-chat',
        'anthropic/claude-haiku-4.5',
        'google/gemini-2.5-flash-preview-09-2025',
    ]) {
        const results = await Promise.all(models.map(async (model) => {
            const startTime = Date.now();
            try {
                const result = await this.callOpenRouter(model, [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ], 0.7, 1000);
                const time = Date.now() - startTime;
                return {
                    model,
                    response: result.content,
                    tokens: result.tokens,
                    time,
                };
            }
            catch (error) {
                console.error(`Error with model ${model}:`, error);
                return {
                    model,
                    response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    tokens: 0,
                    time: Date.now() - startTime,
                };
            }
        }));
        return results;
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
