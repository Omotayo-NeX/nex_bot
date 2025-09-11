'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('nex-ai-model');
    const savedTemp = localStorage.getItem('nex-ai-temperature');
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    
    if (savedTemp) {
      setTemperature(parseFloat(savedTemp));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nex-ai-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('nex-ai-temperature', temperature.toString());
  }, [temperature]);

  const loadSettings = async () => {
    // In the future, this could load from a backend API
    // For now, we just use localStorage
    return Promise.resolve();
  };

  const saveSettings = async () => {
    // In the future, this could save to a backend API
    // For now, localStorage saves automatically via useEffect
    return Promise.resolve();
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