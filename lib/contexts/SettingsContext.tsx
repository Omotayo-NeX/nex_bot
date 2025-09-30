'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { session } = useAuth();
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from backend API when session is available
  useEffect(() => {
    if (session?.access_token) {
      loadSettings();
    }
  }, [session?.access_token]);

  const loadSettings = async () => {
    if (!session?.access_token) {
      // Fallback to localStorage if not authenticated
      const savedModel = localStorage.getItem('nex-ai-model');
      const savedTemp = localStorage.getItem('nex-ai-temperature');

      if (savedModel) setSelectedModel(savedModel);
      if (savedTemp) setTemperature(parseFloat(savedTemp));
      setIsLoaded(true);
      return;
    }

    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedModel(data.preferredModel || 'gpt-4o-mini');
        setTemperature(data.preferredTemperature || 0.7);
      } else {
        // Fallback to localStorage if API fails
        const savedModel = localStorage.getItem('nex-ai-model');
        const savedTemp = localStorage.getItem('nex-ai-temperature');
        
        if (savedModel) setSelectedModel(savedModel);
        if (savedTemp) setTemperature(parseFloat(savedTemp));
      }
    } catch (error) {
      console.error('Failed to load settings from API:', error);
      
      // Fallback to localStorage
      const savedModel = localStorage.getItem('nex-ai-model');
      const savedTemp = localStorage.getItem('nex-ai-temperature');
      
      if (savedModel) setSelectedModel(savedModel);
      if (savedTemp) setTemperature(parseFloat(savedTemp));
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async () => {
    if (!session?.access_token) {
      // Fallback to localStorage if not authenticated
      localStorage.setItem('nex-ai-model', selectedModel);
      localStorage.setItem('nex-ai-temperature', temperature.toString());
      return Promise.resolve();
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          preferredModel: selectedModel,
          preferredTemperature: temperature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Also save to localStorage as backup
      localStorage.setItem('nex-ai-model', selectedModel);
      localStorage.setItem('nex-ai-temperature', temperature.toString());

      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save settings:', error);
      
      // Fallback to localStorage
      localStorage.setItem('nex-ai-model', selectedModel);
      localStorage.setItem('nex-ai-temperature', temperature.toString());
      
      return Promise.reject(error);
    }
  };

  const value = {
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    loadSettings,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}