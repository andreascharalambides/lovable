import { openDB, type IDBPDatabase } from 'idb';
import type { GeneratedPage } from '../stores/app';

const API_KEY_STORAGE_KEY = 'lovable_api_key';
const DB_NAME = 'lovable_db';
const DB_VERSION = 1;
const PAGES_STORE = 'pages';

export class StorageService {
  private db: IDBPDatabase | null = null;

  async initialize() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create pages store if it doesn't exist
          if (!db.objectStoreNames.contains(PAGES_STORE)) {
            const store = db.createObjectStore(PAGES_STORE, {
              keyPath: 'id',
              autoIncrement: false
            });
            store.createIndex('timestamp', 'timestamp');
          }
        }
      });
      console.log('Storage service initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      // Fallback to localStorage if IndexedDB fails
    }
  }

  // API Key Management (localStorage for simplicity)
  saveApiKey(key: string): void {
    try {
      // Simple obfuscation (not real encryption, but better than plain text)
      const obfuscated = btoa(key);
      localStorage.setItem(API_KEY_STORAGE_KEY, obfuscated);
      console.log('API key saved to storage');
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  getApiKey(): string | null {
    try {
      const obfuscated = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (obfuscated) {
        const key = atob(obfuscated);
        console.log('API key retrieved from storage');
        return key;
      }
      return null;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }

  removeApiKey(): void {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      console.log('API key removed from storage');
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }

  // Page History Management (IndexedDB with localStorage fallback)
  async savePage(page: GeneratedPage): Promise<void> {
    if (!this.db) {
      // Fallback to localStorage
      this.savePageToLocalStorage(page);
      return;
    }

    try {
      await this.db.put(PAGES_STORE, page);
      console.log('Page saved to IndexedDB');
    } catch (error) {
      console.error('Failed to save page to IndexedDB:', error);
      this.savePageToLocalStorage(page);
    }
  }

  async getPage(id: string): Promise<GeneratedPage | null> {
    if (!this.db) {
      return this.getPageFromLocalStorage(id);
    }

    try {
      const page = await this.db.get(PAGES_STORE, id);
      return page || null;
    } catch (error) {
      console.error('Failed to get page from IndexedDB:', error);
      return this.getPageFromLocalStorage(id);
    }
  }

  async getAllPages(): Promise<GeneratedPage[]> {
    if (!this.db) {
      return this.getAllPagesFromLocalStorage();
    }

    try {
      const pages = await this.db.getAllFromIndex(PAGES_STORE, 'timestamp');
      console.log(`Retrieved ${pages.length} pages from IndexedDB`);
      return pages.reverse(); // Most recent first
    } catch (error) {
      console.error('Failed to get pages from IndexedDB:', error);
      return this.getAllPagesFromLocalStorage();
    }
  }

  async deletePage(id: string): Promise<void> {
    if (!this.db) {
      this.deletePageFromLocalStorage(id);
      return;
    }

    try {
      await this.db.delete(PAGES_STORE, id);
      console.log('Page deleted from IndexedDB');
    } catch (error) {
      console.error('Failed to delete page from IndexedDB:', error);
      this.deletePageFromLocalStorage(id);
    }
  }

  async clearAllPages(): Promise<void> {
    if (!this.db) {
      this.clearAllPagesFromLocalStorage();
      return;
    }

    try {
      await this.db.clear(PAGES_STORE);
      console.log('All pages cleared from IndexedDB');
    } catch (error) {
      console.error('Failed to clear pages from IndexedDB:', error);
      this.clearAllPagesFromLocalStorage();
    }
  }

  // LocalStorage fallbacks
  private savePageToLocalStorage(page: GeneratedPage): void {
    try {
      const pages = this.getAllPagesFromLocalStorage();
      const index = pages.findIndex(p => p.id === page.id);

      if (index >= 0) {
        pages[index] = page;
      } else {
        pages.push(page);
      }

      // Keep only last 20 pages in localStorage (size limitation)
      const trimmed = pages.slice(-20);
      localStorage.setItem('lovable_pages', JSON.stringify(trimmed));
      console.log('Page saved to localStorage (fallback)');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getPageFromLocalStorage(id: string): GeneratedPage | null {
    try {
      const pages = this.getAllPagesFromLocalStorage();
      return pages.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return null;
    }
  }

  private getAllPagesFromLocalStorage(): GeneratedPage[] {
    try {
      const data = localStorage.getItem('lovable_pages');
      const pages = data ? JSON.parse(data) : [];
      console.log(`Retrieved ${pages.length} pages from localStorage`);
      return pages;
    } catch (error) {
      console.error('Failed to get pages from localStorage:', error);
      return [];
    }
  }

  private deletePageFromLocalStorage(id: string): void {
    try {
      const pages = this.getAllPagesFromLocalStorage();
      const filtered = pages.filter(p => p.id !== id);
      localStorage.setItem('lovable_pages', JSON.stringify(filtered));
      console.log('Page deleted from localStorage');
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
    }
  }

  private clearAllPagesFromLocalStorage(): void {
    try {
      localStorage.removeItem('lovable_pages');
      console.log('All pages cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

export const storageService = new StorageService();