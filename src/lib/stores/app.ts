import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeneratedPage {
  id: string;
  code: string;
  prompt: string;
  timestamp: number;
  messages: Message[];
}

export interface AppState {
  apiKey: string | null;
  currentPage: GeneratedPage | null;
  isGenerating: boolean;
  error: string | null;
  conversation: Message[];
}

function createAppStore() {
  const initialState: AppState = {
    apiKey: null,
    currentPage: null,
    isGenerating: false,
    error: null,
    conversation: []
  };

  const { subscribe, set, update }: Writable<AppState> = writable(initialState);

  return {
    subscribe,

    setApiKey: (key: string | null) =>
        update(s => ({ ...s, apiKey: key })),

    setCurrentPage: (page: GeneratedPage | null) =>
        update(s => ({ ...s, currentPage: page })),

    setGenerating: (isGenerating: boolean) =>
        update(s => ({ ...s, isGenerating })),

    setError: (error: string | null) =>
        update(s => ({ ...s, error })),

    addMessage: (msg: Message) =>
        update(s => ({ ...s, conversation: [...s.conversation, msg] })),

    loadConversation: (messages: Message[]) =>
        update(s => ({ ...s, conversation: messages })),

    clearConversation: () =>
        update(s => ({ ...s, conversation: [] })),

    reset: () => {
      update(s => ({
        ...initialState,
        apiKey: s.apiKey // Preserve API key
      }));
    }
  };
}

export const appStore = createAppStore();

export const hasApiKey: Readable<boolean> = derived(
    appStore,
    $app => !!$app.apiKey
);

export const canGenerate: Readable<boolean> = derived(
    appStore,
    $app => !!$app.apiKey && !$app.isGenerating
);