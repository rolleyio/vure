import {
  StorageService,
  useStorageEmulator,
  getStorage,
} from 'firebase/storage';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

import type { VureEmulatorConfig } from '../types';

let storage: StorageService | null = null;

export function useStorage() {
  if (!storage) {
    throw new Error(
      'You need to enable the storage feature before calling useStorage',
    );
  }

  return storage;
}

export function initializeStorage(
  emulator: VureEmulatorConfig = {
    enabled: false,
    host: 'localhost',
    port: 9199,
  },
) {
  storage = markRaw(getStorage(useFirebaseApp()));

  if (emulator.enabled) {
    useStorageEmulator(
      storage,
      emulator.host ?? 'localhost',
      emulator.port ?? 9199,
    );
  }

  return storage;
}
