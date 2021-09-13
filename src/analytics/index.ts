import {
  getAnalytics,
  Analytics,
  isSupported,
} from 'firebase/analytics';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let analytics: Analytics | null;

export function useAnalytics() {
  if (!analytics) {
    throw new Error(
      "You need to enable the analytics feature before calling useAnalytics or your environment isn't supported",
    );
  }

  return analytics;
}

export function initializeAnalytics() {
  isSupported().then((supported) => {
    if (supported) {
      analytics = markRaw(getAnalytics(useFirebaseApp()));
    }
  });

  return analytics;
}
