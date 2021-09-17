import {
  Firestore,
  initializeFirestore as firestoreInitialize,
  connectFirestoreEmulator,
} from 'firebase/firestore';

import { useFirebaseApp } from '../../firebase';

import type { VureEmulatorConfig } from '../../types';

let firestore: Firestore | null = null;

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
  firestore = firestoreInitialize(useFirebaseApp(), {
    experimentalAutoDetectLongPolling: true,
  });

  if (emulator.enabled) {
    connectFirestoreEmulator(
      firestore,
      emulator.host ?? 'localhost',
      emulator.port ?? 8080,
    );
  }

  return firestore;
}
