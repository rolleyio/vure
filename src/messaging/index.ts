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
      "You need to enable the messaging feature before calling useMessaging or your environment isn't supported",
    );
  }

  return messaging;
}

export function initializeMessaging() {
  isSupported().then((supported) => {
    if (supported) {
      messaging = markRaw(getMessaging(useFirebaseApp()));
    }
  });

  return messaging;
}
