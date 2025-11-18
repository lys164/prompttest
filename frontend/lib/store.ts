import { create } from 'zustand';

// ===== 游戏状态 Store =====
interface GameStore {
    userId: string;
    setUserId: (userId: string) => void;

    currentSessionId: string | null;
    setCurrentSessionId: (sessionId: string | null) => void;

    gameMode: 'normal' | 'debug' | 'compare';
    setGameMode: (mode: 'normal' | 'debug' | 'compare') => void;

    currentNarrative: string;
    setCurrentNarrative: (narrative: string) => void;

    choices: Array<{ id: string; text: string }>;
    setChoices: (choices: Array<{ id: string; text: string }>) => void;

    dialogueHistory: any[];
    addDialogue: (dialogue: any) => void;
    clearDialogueHistory: () => void;

    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    error: string | null;
    setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    userId: typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest-' + Math.random() : 'guest',
    setUserId: (userId) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userId', userId);
        }
        set({ userId });
    },

    currentSessionId: null,
    setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

    gameMode: 'normal',
    setGameMode: (mode) => set({ gameMode: mode }),

    currentNarrative: '',
    setCurrentNarrative: (narrative) => set({ currentNarrative: narrative }),

    choices: [],
    setChoices: (choices) => set({ choices }),

    dialogueHistory: [],
    addDialogue: (dialogue) => set((state) => ({ dialogueHistory: [...state.dialogueHistory, dialogue] })),
    clearDialogueHistory: () => set({ dialogueHistory: [] }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    error: null,
    setError: (error) => set({ error }),
}));

// ===== 脚本 Store =====
interface ScriptStore {
    scripts: any[];
    setScripts: (scripts: any[]) => void;

    selectedScript: any | null;
    setSelectedScript: (script: any | null) => void;

    selectedCharacters: string[];
    setSelectedCharacters: (characters: string[]) => void;
    toggleCharacter: (characterId: string) => void;

    isLoadingScripts: boolean;
    setIsLoadingScripts: (loading: boolean) => void;
}

export const useScriptStore = create<ScriptStore>((set) => ({
    scripts: [],
    setScripts: (scripts) => set({ scripts }),

    selectedScript: null,
    setSelectedScript: (script) => set({ selectedScript: script }),

    selectedCharacters: [],
    setSelectedCharacters: (characters) => set({ selectedCharacters: characters }),
    toggleCharacter: (characterId) =>
        set((state) => ({
            selectedCharacters: state.selectedCharacters.includes(characterId)
                ? state.selectedCharacters.filter((id) => id !== characterId)
                : [...state.selectedCharacters, characterId],
        })),

    isLoadingScripts: false,
    setIsLoadingScripts: (loading) => set({ isLoadingScripts: loading }),
}));

// ===== 开发者模式 Store =====
interface DevStore {
    debugSessionId: string | null;
    setDebugSessionId: (sessionId: string | null) => void;

    debugResponses: any[];
    addDebugResponse: (response: any) => void;
    clearDebugResponses: () => void;

    compareResults: any[];
    setCompareResults: (results: any[]) => void;

    customPrompt: string;
    setCustomPrompt: (prompt: string) => void;

    selectedModel: string;
    setSelectedModel: (model: string) => void;

    availableModels: any[];
    setAvailableModels: (models: any[]) => void;

    isDevMode: boolean;
    toggleDevMode: () => void;
}

export const useDevStore = create<DevStore>((set) => ({
    debugSessionId: null,
    setDebugSessionId: (sessionId) => set({ debugSessionId: sessionId }),

    debugResponses: [],
    addDebugResponse: (response) => set((state) => ({ debugResponses: [...state.debugResponses, response] })),
    clearDebugResponses: () => set({ debugResponses: [] }),

    compareResults: [],
    setCompareResults: (results) => set({ compareResults: results }),

    customPrompt: '',
    setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

    selectedModel: 'gpt-4-turbo-preview',
    setSelectedModel: (model) => set({ selectedModel: model }),

    availableModels: [],
    setAvailableModels: (models) => set({ availableModels: models }),

    isDevMode: false,
    toggleDevMode: () => set((state) => ({ isDevMode: !state.isDevMode })),
}));

