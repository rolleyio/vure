import {
  StorageService,
  useStorageEmulator,
  getStorage,
} from 'firebase/storage';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let storage: StorageService | null = null;

export function useStorage() {
  if (!storage) {
    throw new Error(
      'You need to enable the storage feature before calling useStorage',
    );
  }

  return storage;
}

export function initializeStorage() {
  storage = markRaw(getStorage(useFirebaseApp()));

  if (import.meta.env.DEV) {
    useStorageEmulator(storage, 'localhost', 9199);
  }

  return storage;
}
