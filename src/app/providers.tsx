'use client';

import { useEffect, type ReactNode } from 'react';
import { useDeckStore } from '@/stores/deckStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function Providers({ children }: { children: ReactNode }) {
  const loadDecks = useDeckStore((state) => state.loadDecks);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    // Initialize stores
    loadSettings();
    loadDecks();
  }, [loadDecks, loadSettings]);

  return <>{children}</>;
}
