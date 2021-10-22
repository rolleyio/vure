import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';

import { useFirebaseApp } from '../firebase';

import type { VureAuthEmulatorConfig } from '../types';

let auth: Auth | null = null;

export function useAuth() {
  if (!auth) {
    throw new Error('You need to enable the auth feature before using useAuth');
  }

  return auth;
}

export function initializeAuth(
  emulator: VureAuthEmulatorConfig = {
    enabled: false,
    url: 'http://localhost:9099',
  },
) {
  auth = getAuth(useFirebaseApp());

  if (emulator.enabled) {
    connectAuthEmulator(auth, emulator.url ?? 'http://localhost:9099');
  }

  return auth;
}
