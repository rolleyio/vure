import {
  FirebaseFirestore,
  getFirestore,
  useFirestoreEmulator,
} from 'firebase/firestore';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../../composables';

let firestore: FirebaseFirestore | null = null;

export function useFirestore() {
  if (!firestore) {
    throw new Error(
      'You need to enable the firestore feature before calling useFirestore',
    );
  }

  return firestore;
}

export function initializeFirestore() {
  firestore = markRaw(getFirestore(useFirebaseApp()));

  if (import.meta.env.DEV) {
    useFirestoreEmulator(firestore, 'localhost', 8080);
  }

  return firestore;
}
