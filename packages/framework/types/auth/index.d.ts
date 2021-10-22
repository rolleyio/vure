import { Auth } from 'firebase/auth';
import type { VureAuthEmulatorConfig } from '../types';
export declare function useAuth(): Auth;
export declare function initializeAuth(emulator?: VureAuthEmulatorConfig): Auth;
