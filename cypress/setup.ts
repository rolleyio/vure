import { clearFirestoreData } from '@firebase/rules-unit-testing';

import { initializeFirebaseApp, initializeFirestore } from '../src';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

afterEach(() => {
  // clearFirestoreData({ projectId: 'vure' });
});
