"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SettingsManager } from './settings-manager';
import { AppSettings, DEFAULT_SETTINGS } from './settings';

interface SettingsContextType {
  settings: AppSettings;
  settingsManager: SettingsManager;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [settingsManager] = useState(() => new SettingsManager());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      settingsManager.setUserId(session.user.id);
    }
    
    setSettings(settingsManager.getSettings());
    setIsLoading(false);

    const unsubscribe = settingsManager.subscribe(setSettings);
    return unsubscribe;
  }, [session?.user?.id, settingsManager]);

  return (
    <SettingsContext.Provider value={{ settings, settingsManager, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
