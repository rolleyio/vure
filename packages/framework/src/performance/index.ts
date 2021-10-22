import { getPerformance, FirebasePerformance } from 'firebase/performance';

import { useFirebaseApp } from '../firebase';

let performance: FirebasePerformance | null = null;

export function usePerformance() {
  if (!performance) {
    throw new Error('You need to enable the performance feature before calling usePerformance');
  }

  return performance;
}

export function initializePerformance() {
  performance = getPerformance(useFirebaseApp());

  return performance;
}
