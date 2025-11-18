// ===== AI 角色类型 =====
export interface UserAICharacter {
    id: string;
    userId: string;
    姓名: string;
    和用户的身份: string;
    超能力: Array<{
        名称: string;
        等级: number;
        描述: string;
    }>;
    是否有原型: boolean;
    年龄: number;
    生日: string;
    国籍: string;
    语言: string[];
    外貌描述: string;
    喜好特长: string[];
    讨厌的东西: string[];
    星座: string;
    MBTI: string;
    面对未知的态度: string;
    恐惧软肋: string;
    头像: string;
    创建时间: Date;
    更新时间: Date;
}

// ===== 剧本角色详细设定 =====
export interface ScriptCharacterDetail {
    roleId: string;
    角色简介: string;
    角色目标: string;
    角色视角的故事背景: string;
    第一个选择点: string;
    预置策略选项: Array<{
        id: string;
        文本: string;
        后果描述: string;
        推荐AI特征: string[];
    }>;
}

// ===== 剧本中的角色池 =====
export interface ScriptCharacter {
    id: string;
    roleId: string;
    姓名: string;
    角色简介: string;
    角色目标: string;
    角色视角的故事背景: string;
    第一个选择点: string;
    预置策略选项: Array<{
        id: string;
        文本: string;
        后果描述: string;
        推荐AI特征: string[];
    }>;
}

// ===== 剧本相关类型 =====
export interface Script {
    id: string;
    剧本类别: '【单人】【单AI】' | '【单人】【多AI】' | '【多人】【多AI】';
    品类标签: string[];
    参与AI数: number;
    剧本简介: string;
    剧本封面: string;
    故事内容: string;
    角色池: ScriptCharacter[];
    角色详细设定: ScriptCharacterDetail[];
    创建时间: Date;
    更新时间: Date;
    难度: 'easy' | 'normal' | 'hard';
    预计时长: number;
}

// ===== 场景相关类型 =====
export interface Scene {
    id: string;
    scriptId: string;
    sceneNumber: number;
    description: string;
    context: string;
    choices: Choice[];
}

export interface Choice {
    id: string;
    text: string;
    consequence?: string;
}

// ===== 角色映射 =====
export interface CharacterMapping {
    userAICharacterId: string;    // 用户的AI角色ID
    scriptRoleId: string;         // 剧本中的角色ID
    scriptCharacterName: string;  // 剧本角色名称
    userAICharacterName: string;  // 用户AI角色的名称
    userAICharacter?: UserAICharacter; // 缓存的AI角色完整信息
    isVariableMapping?: boolean;  // 是否来自变量映射
}

// ===== 游戏会话相关类型 =====
export interface GameSession {
    id: string;
    scriptId: string;
    userId: string;
    characterMappings: CharacterMapping[]; // 角色映射列表
    mode: 'normal' | 'debug' | 'compare';
    currentSceneId: string;
    currentChoicePoint: string;
    dialogueHistory: DialogueEntry[];
    choiceHistory: Array<{
        选择点ID: string;
        选择的选项: string;
        时间戳: Date;
    }>;
    startedAt: Date;
    updatedAt: Date;
    status: 'ongoing' | 'completed' | 'abandoned';
}

export interface DialogueEntry {
    id: string;
    roleId: string;              // 角色在剧本中的ID
    userAICharacterId: string;   // 对应的用户AI角色ID
    userAICharacterName: string; // 用户AI角色名
    scriptCharacterName: string; // 剧本角色名
    content: string;
    type: 'user-input' | 'ai-response' | 'narrative';
    timestamp: Date;
    modelUsed?: string;
    systemPrompt?: string;       // 请求模型时使用的系统提示（仅用于调试）
    userPrompt?: string;         // 请求模型时使用的用户提示（仅用于调试）
}

// ===== AI相关类型 =====
export interface ParticipatingCharacter {
    userAICharacterId: string;
    userAICharacter: UserAICharacter;
    scriptCharacter: ScriptCharacter;
    roleDetail: ScriptCharacterDetail;
}

export interface GenerationRequest {
    sessionId: string;
    currentContext: string;
    userChoice: string;
    participatingCharacters: ParticipatingCharacter[];
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
    model?: string;  // 选择使用的 AI 模型
    scriptType?: string;  // 剧本类型：single-single, single-multi, multi-multi
}

export interface GenerationResponse {
    narrative: string;
    nextChoicePoint: string;
    newOptions: Array<{
        id: string;
        文本: string;
        后果描述: string;
    }>;
    characterResponses: Array<{
        characterId: string;
        characterName: string;
        response: string;
    }>;
    modelUsed: string;
    generationTime: number;
}

// ===== 开发者模式相关类型 =====
export interface DebugMode {
    sessionId: string;
    selectedModel: string;
    customPrompt: string;
    responses: DebugResponse[];
}

export interface DebugResponse {
    id: string;
    prompt: string;
    response: string;
    model: string;
    timestamp: Date;
    tokens: {
        input: number;
        output: number;
    };
}

export interface CompareMode {
    sessionId: string;
    selectedModels: string[];
    currentPrompt: string;
    responses: {
        model: string;
        response: string;
        timestamp: Date;
        tokens: number;
    }[];
}

