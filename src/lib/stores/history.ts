import { writable, derived, get } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import type { GeneratedPage } from './app';

interface HistoryState {
  pages: GeneratedPage[];
  currentIndex: number;
  maxSize: number;
}

function createHistoryStore() {
  const initialState: HistoryState = {
    pages: [],
    currentIndex: -1,
    maxSize: 50
  };

  const { subscribe, set, update }: Writable<HistoryState> = writable(initialState);

  return {
    subscribe,

    push: (page: GeneratedPage) => {
      update(state => {
        // Remove forward history when pushing new
        const newPages = [...state.pages.slice(0, state.currentIndex + 1), page];

        // Trim if exceeds max size
        if (newPages.length > state.maxSize) {
          newPages.shift();
        }

        return {
          ...state,
          pages: newPages,
          currentIndex: newPages.length - 1
        };
      });
    },

    undo: (): GeneratedPage | null => {
      const state = get(historyStore);
      if (state.currentIndex > 0) {
        update(s => ({ ...s, currentIndex: s.currentIndex - 1 }));
        return state.pages[state.currentIndex - 1];
      }
      return null;
    },

    redo: (): GeneratedPage | null => {
      const state = get(historyStore);
      if (state.currentIndex < state.pages.length - 1) {
        update(s => ({ ...s, currentIndex: s.currentIndex + 1 }));
        return state.pages[state.currentIndex + 1];
      }
      return null;
    },

    getCurrentPage: (): GeneratedPage | null => {
      const state = get(historyStore);
      return state.currentIndex >= 0 ? state.pages[state.currentIndex] : null;
    },

    loadHistory: (pages: GeneratedPage[]) => {
      set({
        pages,
        currentIndex: pages.length - 1,
        maxSize: 50
      });
    },

    clear: () => set(initialState)
  };
}

export const historyStore = createHistoryStore();

export const canUndo: Readable<boolean> = derived(
    historyStore,
    $history => $history.currentIndex > 0
);

export const canRedo: Readable<boolean> = derived(
    historyStore,
    $history => $history.currentIndex < $history.pages.length - 1
);