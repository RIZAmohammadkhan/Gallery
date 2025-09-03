import { AppSettings, DEFAULT_SETTINGS } from './settings';

export class SettingsManager {
  private settings: AppSettings;
  private listeners: Array<(settings: AppSettings) => void> = [];
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
    this.settings = { ...DEFAULT_SETTINGS };
    
    // Load settings asynchronously if userId is provided
    if (this.userId) {
      this.loadSettingsFromDB();
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.loadSettingsFromDB();
  }

  private async loadSettingsFromDB(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const dbSettings = await response.json();
        if (dbSettings && Object.keys(dbSettings).length > 0) {
          this.settings = { ...DEFAULT_SETTINGS, ...dbSettings };
          this.notifyListeners();
        }
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Failed to load settings from database:', error);
      // Fall back to localStorage for backward compatibility
      this.loadSettingsFromLocalStorage();
    }
  }

  private loadSettingsFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('gallery-app-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
        this.notifyListeners();
        
        // Migrate to database if user is logged in
        if (this.userId) {
          this.saveSettingsToDB();
          // Clear localStorage after migration
          localStorage.removeItem('gallery-app-settings');
        }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }

  private async saveSettingsToDB(): Promise<void> {
    if (!this.userId) return;

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.settings),
      });
      
      if (response.ok) {
        this.notifyListeners();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings to database:', error);
      // Fall back to localStorage
      this.saveSettingsToLocalStorage();
    }
  }

  private saveSettingsToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('gallery-app-settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    if (this.userId) {
      this.saveSettingsToDB();
    } else {
      this.saveSettingsToLocalStorage();
    }
  }

  updateGeminiApiKey(apiKey: string): void {
    this.settings.geminiApiKey = apiKey;
    if (this.userId) {
      this.saveSettingsToDB();
    } else {
      this.saveSettingsToLocalStorage();
    }
  }

  getGeminiApiKey(): string {
    // First check environment variable, then settings
    if (typeof window !== 'undefined') {
      return this.settings.geminiApiKey || '';
    }
    return process.env.GEMINI_API_KEY || this.settings.geminiApiKey || '';
  }

  isGeminiConfigured(): boolean {
    return !!this.getGeminiApiKey();
  }

  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    if (this.userId) {
      this.saveSettingsToDB();
    } else {
      this.saveSettingsToLocalStorage();
    }
  }

  exportSettings(): string {
    const exportData = {
      ...this.settings,
      // Don't export sensitive data
      geminiApiKey: ''
    };
    return JSON.stringify(exportData, null, 2);
  }

  importSettings(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      // Validate the imported data structure
      if (typeof imported === 'object' && imported !== null) {
        this.updateSettings(imported);
        return true;
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
    return false;
  }
}

export const settingsManager = new SettingsManager();
