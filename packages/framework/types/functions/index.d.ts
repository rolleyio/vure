import { Functions, HttpsCallableOptions } from 'firebase/functions';
import type { VureEmulatorConfig } from '../types';
export declare function useFunctions(): Functions;
export declare function initializeFunctions(regionOrCustomDomain?: string, emulator?: VureEmulatorConfig): Functions;
export declare function httpsCallable<RequestData = unknown, ResponseData = unknown>(functionName: string, options?: HttpsCallableOptions): import("firebase/functions").HttpsCallable<RequestData, ResponseData>;
