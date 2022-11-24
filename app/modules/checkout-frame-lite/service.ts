import Browserstorage from 'browserstorage';
import type { Preferences } from 'razorpay/types/Preferences';

const generateLitePreferencesStorageKey = (merchantKey: string) =>
  `rzp_lite_preferences_${merchantKey}`;

export function getLitePreferencesFromStorage(
  merchantKey: string
): null | { updatedAt: number; preferences: Preferences } {
  const existingPrefs: string | null = Browserstorage.getItem(
    generateLitePreferencesStorageKey(merchantKey)
  );

  if (existingPrefs) {
    try {
      return JSON.parse(existingPrefs);
    } catch (e) {}
  }

  return null;
}

export function setLitePreferencesToStorage(
  prefs: Preferences,
  merchantKey: string
) {
  Browserstorage.setItem(
    generateLitePreferencesStorageKey(merchantKey),
    JSON.stringify({
      preferences: prefs,
      updatedAt: Date.now(),
    })
  );
}
