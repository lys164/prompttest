import { create } from 'zustand';

// ===== 游戏状态 Store =====
interface GameStore {
    userId: string;
    setUserId: (userId: string) => void;

    currentSessionId: string | null;
    setCurrentSessionId: (sessionId: string | null) => void;

    gameMode: 'normal' | 'compare';
    setGameMode: (mode: 'normal' | 'compare') => void;

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

