import {
  FirebaseApp,
  initializeApp,
  getApp,
  FirebaseOptions,
} from 'firebase/app';
import { markRaw } from 'vue';

let firebaseApp: FirebaseApp | null = null;

export function useFirebaseApp() {
  if (!firebaseApp) {
    throw new Error(
      'You need to call initializeFirebaseApp before calling useFirebaseApp',
    );
  }

  return firebaseApp;
}

export function initializeFirebaseApp(
  options: FirebaseOptions,
  name?: string,
) {
  firebaseApp = markRaw(initializeApp(options, name));

  return firebaseApp;
}
