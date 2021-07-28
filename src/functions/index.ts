import { markRaw } from 'vue';
import {
  Functions,
  getFunctions,
  useFunctionsEmulator,
} from 'firebase/functions';

import { useFirebaseApp } from '../composables';

let functions: Functions | null = null;

export function useFunctions() {
  if (!functions) {
    throw new Error(
      'You need to enable the functions feature before calling useFunctions',
    );
  }

  return functions;
}

export function initializeFunctions() {
  functions = markRaw(getFunctions(useFirebaseApp()));

  if (import.meta.env.DEV) {
    useFunctionsEmulator(functions, 'localhost', 5001);
  }

  return functions;
}
