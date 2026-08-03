import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const WEB_KEY_PREFIX = 'health360.';

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

function toWebKey(key: string): string {
  return `${WEB_KEY_PREFIX}${key}`;
}

const webStorage: KeyValueStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(toWebKey(key));
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(toWebKey(key), value);
  },
  async deleteItem(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(toWebKey(key));
  },
};

const nativeStorage: KeyValueStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

/** Secure storage on native; localStorage on web. */
export const platformStorage: KeyValueStorage =
  Platform.OS === 'web' ? webStorage : nativeStorage;
