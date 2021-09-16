import {
  FirebaseApp,
  initializeApp,
  FirebaseOptions,
} from 'firebase/app';

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
  firebaseApp = initializeApp(options, name);

  return firebaseApp;
}
