import { parse } from 'utils/object';
import { writable } from 'svelte/store';
import BrowserStorage from 'browserstorage';
import { isNonNullObject } from 'utils/object';
import { TRUECALLER_USER_METRIC_STORAGE_KEY_NAME } from './constants';

import type { UserMetricStore, TruecallerPresentStore } from './types';

export const truecallerAttemptCount = writable<number>(0);
export const truecallerPresent = writable<TruecallerPresentStore>(null);
export const truecallerUserMetric = writable<UserMetricStore>(
  getUserMetricFromStorage()
);

// Browsers block any popup or external navigation if there was no
// user interaction after X seconds (here X varies depending
// on mechanism involved like api call, async timeout etc)
// If this threshold is crossed, we want to show a CTA
// to proceed, so that popup is not blocked.
export const shouldShowProceedOverlay = writable<boolean>(false);

export function incrementAttemptCount() {
  truecallerAttemptCount.update((count) => count + 1);
}

function setUserMetricToStorage(userMetric: UserMetricStore) {
  try {
    return BrowserStorage.setItem(
      TRUECALLER_USER_METRIC_STORAGE_KEY_NAME,
      JSON.stringify(userMetric)
    );
  } catch (error) {
    return false;
  }
}

function getUserMetricFromStorage(): UserMetricStore {
  const defaultUserMetric = {
    skipped_count: 0,
    timestamp: Date.now(),
  };

  try {
    const userMetric = parse(
      BrowserStorage.getItem(TRUECALLER_USER_METRIC_STORAGE_KEY_NAME) as string
    );

    if (
      !isNonNullObject(userMetric) ||
      typeof userMetric.skipped_count !== 'number' ||
      typeof userMetric.timestamp !== 'number'
    ) {
      return defaultUserMetric;
    }

    return userMetric;
  } catch (error) {
    return defaultUserMetric;
  }
}

truecallerUserMetric.subscribe((userMetric: UserMetricStore) => {
  if (userMetric) {
    setUserMetricToStorage(userMetric);
  }
});
