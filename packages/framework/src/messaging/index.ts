import {
  getMessaging,
  Messaging,
  isSupported,
} from 'firebase/messaging';

import { useFirebaseApp } from '../firebase';

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
      messaging = getMessaging(useFirebaseApp());
    }
  });

  return messaging;
}
