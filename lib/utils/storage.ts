import { Settings, DEFAULT_SETTINGS } from '../types';
import { Problem } from '../constants';

const isClient = () => typeof window !== 'undefined';

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (!isClient()) return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? { ...defaultValue, ...JSON.parse(saved) } : defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (isClient()) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const loadSettings = (): Settings =>
  getFromStorage('ronshows_settings', DEFAULT_SETTINGS);

export const saveSettings = (settings: Settings): void =>
  saveToStorage('ronshows_settings', settings);

export const loadCustomProblems = (): Problem[] => {
  if (!isClient()) return [];
  const saved = localStorage.getItem('ronshows_custom_problems');
  return saved ? JSON.parse(saved) : [];
};

export const saveCustomProblems = (problems: Problem[]): void =>
  saveToStorage('ronshows_custom_problems', problems);
