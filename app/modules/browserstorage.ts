/**
 * In-memory version of window.localStorage
 */

import type { CustomObject } from 'types';

interface BrowserStorageType {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
}

/**
 * Determines which storage to use:
 * window.localStorage, or BrowserStorage
 *
 * @returns {localStorage|Object}
 */
class BrowserStorage implements BrowserStorageType {
  customStorage: CustomObject<string> = {};

  constructor() {
    // Get current timestamp
    const now = new Date().getTime();
    try {
      // Put current timestamp in storage and verify if storage is available
      global.localStorage.setItem('customStorage', now.toString());
      const fromStorage: string | null =
        global.localStorage.getItem('customStorage');
      global.localStorage.removeItem('customStorage');

      // If timestamp from storage doesn't match, use our mocked storage
      if (now !== parseInt(<string>fromStorage)) {
        return this;
      }

      return <any>global.localStorage;
    } catch (err) {
      // In case something fails, use our mocked storage.
      return this;
    }
  }

  setItem(key: string, value: string) {
    this.customStorage[key] = value;
  }

  getItem(key: string) {
    return this.customStorage[key] || null;
  }

  removeItem(key: string) {
    delete this.customStorage[key];
  }
}

export default new BrowserStorage();
