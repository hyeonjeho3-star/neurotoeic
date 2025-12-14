/**
 * Settings Store - Manages app-wide settings with persistence
 */

import { create } from 'zustand';
import { getSetting, setSetting } from '@/lib/db/repository';

export interface SettingsState {
  // FSRS settings
  requestRetention: number;
  maximumInterval: number;

  // Session settings
  defaultSessionMinutes: number;
  learningSteps: number[];
  relearningSteps: number[];

  // Daily limits
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;

  // Rest reminder
  restReminderMinutes: number;

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => Promise<void>;
  updateSettings: (updates: Partial<SettingsState>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  defaultSessionMinutes: 10,
  learningSteps: [1, 10],
  relearningSteps: [10],
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 100,
  restReminderMinutes: 15,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoading: false,
  isInitialized: false,

  loadSettings: async () => {
    set({ isLoading: true });

    try {
      const savedSettings = await getSetting<Partial<typeof DEFAULT_SETTINGS>>('settings');

      if (savedSettings) {
        set({
          ...DEFAULT_SETTINGS,
          ...savedSettings,
          isInitialized: true,
        });
      } else {
        await setSetting('settings', DEFAULT_SETTINGS);
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSetting: async (key, value) => {
    const { isLoading, isInitialized, loadSettings, updateSetting, updateSettings, resetSettings, ...currentSettings } = get();

    const newSettings = {
      ...currentSettings,
      [key]: value,
    };

    set({ [key]: value } as Partial<SettingsState>);

    try {
      await setSetting('settings', newSettings);
    } catch (error) {
      console.error('Failed to save setting:', error);
      set({ [key]: currentSettings[key as keyof typeof currentSettings] } as Partial<SettingsState>);
    }
  },

  updateSettings: async (updates) => {
    const { isLoading, isInitialized, loadSettings, updateSetting, updateSettings, resetSettings, ...currentSettings } = get();

    const newSettings = {
      ...currentSettings,
      ...updates,
    };

    set(updates as Partial<SettingsState>);

    try {
      await setSetting('settings', newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      set(currentSettings as Partial<SettingsState>);
    }
  },

  resetSettings: async () => {
    set({ isLoading: true });

    try {
      await setSetting('settings', DEFAULT_SETTINGS);
      set({
        ...DEFAULT_SETTINGS,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      set({ isLoading: false });
    }
  },
}));
