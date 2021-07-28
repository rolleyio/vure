import {
  FirebaseFirestore,
  getFirestore,
  useFirestoreEmulator,
} from 'firebase/firestore';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../../composables';

import type { VureEmulatorConfig } from '../../types';

let firestore: FirebaseFirestore | null = null;

export function useFirestore() {
  if (!firestore) {
    throw new Error(
      'You need to enable the firestore feature before calling useFirestore',
    );
  }

  return firestore;
}

export function initializeFirestore(
  emulator: VureEmulatorConfig = {
    enabled: false,
    host: 'localhost',
    port: 8080,
  },
) {
  firestore = markRaw(getFirestore(useFirebaseApp()));

  if (emulator.enabled) {
    useFirestoreEmulator(
      firestore,
      emulator.host ?? 'localhost',
      emulator.port ?? 8080,
    );
  }

  return firestore;
}
