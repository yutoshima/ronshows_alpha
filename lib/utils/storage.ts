import { Settings, DEFAULT_SETTINGS } from '../types';
import { Problem } from '../constants';

export const loadSettings = (): Settings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem('ronshows_settings');
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Settings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ronshows_settings', JSON.stringify(settings));
  }
};

export const loadCustomProblems = (): Problem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('ronshows_custom_problems');
  return saved ? JSON.parse(saved) : [];
};

export const saveCustomProblems = (problems: Problem[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ronshows_custom_problems', JSON.stringify(problems));
  }
};
