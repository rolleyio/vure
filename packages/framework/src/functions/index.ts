import {
  Functions,
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable as callable,
  HttpsCallableOptions,
} from 'firebase/functions';

import { useFirebaseApp } from '../firebase';
import type { VureEmulatorConfig } from '../types';

let functions: Functions | null = null;

export function useFunctions() {
  if (!functions) {
    throw new Error('You need to enable the functions feature before calling useFunctions');
  }

  return functions;
}

export function initializeFunctions(
  regionOrCustomDomain?: string,
  emulator: VureEmulatorConfig = {
    enabled: false,
    host: 'localhost',
    port: 5001,
  },
) {
  functions = getFunctions(useFirebaseApp(), regionOrCustomDomain);

  if (emulator.enabled) {
    connectFunctionsEmulator(functions, emulator.host ?? 'localhost', emulator.port ?? 5001);
  }

  return functions;
}

export function httpsCallable<RequestData = unknown, ResponseData = unknown>(
  functionName: string,
  options?: HttpsCallableOptions,
) {
  return callable<RequestData, ResponseData>(useFunctions(), functionName, options);
}
