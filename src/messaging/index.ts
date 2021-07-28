import { getMessaging, FirebaseMessaging } from 'firebase/messaging';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let messaging: FirebaseMessaging | null = null;

export function useMessaging() {
  if (!messaging) {
    throw new Error(
      'You need to enable the messaging feature before calling useMessaging',
    );
  }

  return messaging;
}

export function initializeMessaging() {
  messaging = markRaw(getMessaging(useFirebaseApp()));

  return messaging;
}
