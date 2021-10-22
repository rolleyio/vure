import { Firestore } from 'firebase/firestore';
import type { VureEmulatorConfig } from '../../types';
export declare function useFirestore(): Firestore;
export declare function initializeFirestore(emulator?: VureEmulatorConfig): Firestore;
