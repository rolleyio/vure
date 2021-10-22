import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

import { useFirebaseApp } from '../firebase';

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
      analytics = getAnalytics(useFirebaseApp());
    }
  });

  return analytics;
}
