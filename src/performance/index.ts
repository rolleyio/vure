import {
  getPerformance,
  FirebasePerformance,
} from 'firebase/performance';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let performance: FirebasePerformance | null = null;

export function usePerformance() {
  if (!performance) {
    throw new Error(
      'You need to enable the performance feature before calling usePerformance',
    );
  }

  return performance;
}

export function initializePerformance() {
  performance = markRaw(getPerformance(useFirebaseApp()));

  return performance;
}
