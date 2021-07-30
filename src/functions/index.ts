import { markRaw } from 'vue';
import {
  Functions,
  getFunctions,
  connectFunctionsEmulator,
} from 'firebase/functions';

import { useFirebaseApp } from '../composables';

import type { VureEmulatorConfig } from '../types';

let functions: Functions | null = null;

export function useFunctions() {
  if (!functions) {
    throw new Error(
      'You need to enable the functions feature before calling useFunctions',
    );
  }

  return functions;
}

export function initializeFunctions(
  emulator: VureEmulatorConfig = {
    enabled: false,
    host: 'localhost',
    port: 5001,
  },
) {
  functions = markRaw(getFunctions(useFirebaseApp()));

  if (emulator.enabled) {
    connectFunctionsEmulator(
      functions,
      emulator.host ?? 'localhost',
      emulator.port ?? 5001,
    );
  }

  return functions;
}
