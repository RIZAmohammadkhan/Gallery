import { AppSettings, DEFAULT_SETTINGS } from './settings';

const SETTINGS_KEY = 'gallery-app-settings';

export class SettingsManager {
  private settings: AppSettings;
  private listeners: Array<(settings: AppSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
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
    this.saveSettings();
  }

  updateGeminiApiKey(apiKey: string): void {
    this.settings.geminiApiKey = apiKey;
    this.saveSettings();
  }

  updateCloudConfig(cloudConfig: Partial<AppSettings['cloudStorage']>): void {
    this.settings.cloudStorage = { ...this.settings.cloudStorage, ...cloudConfig };
    this.saveSettings();
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

  isCloudStorageConfigured(): boolean {
    const { cloudStorage } = this.settings;
    return cloudStorage.enabled && !!cloudStorage.provider && 
           Object.keys(cloudStorage.credentials).length > 0;
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
    this.saveSettings();
  }

  exportSettings(): string {
    const exportData = {
      ...this.settings,
      // Don't export sensitive data
      geminiApiKey: '',
      cloudStorage: {
        ...this.settings.cloudStorage,
        credentials: {}
      }
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
