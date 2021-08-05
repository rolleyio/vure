import { initializeFirebaseApp, initializeFirestore } from '../../';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });
