import {
  getMessaging,
  Messaging,
  isSupported,
} from 'firebase/messaging';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let messaging: Messaging | null = null;

export function useMessaging() {
  if (!messaging) {
    throw new Error(
      'You need to enable the messaging feature before calling useMessaging',
    );
  }

  return messaging;
}

export function initializeMessaging() {
  if (isSupported()) {
    messaging = markRaw(getMessaging(useFirebaseApp()));
  }

  return messaging;
}
