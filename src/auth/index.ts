import { markRaw, shallowRef } from 'vue';
import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  connectAuthEmulator,
} from 'firebase/auth';

import { useFirebaseApp } from '../composables';

import type { VureAuthEmulatorConfig } from '../types';

let auth: Auth | null = null;
let user = shallowRef<User | null>(null);

export function useAuth() {
  if (!auth) {
    throw new Error(
      'You need to enable the auth feature before using useAuth',
    );
  }

  return auth;
}

export function useUser() {
  return user;
}

export function initializeAuth(
  emulator: VureAuthEmulatorConfig = {
    enabled: false,
    url: 'http://localhost:9099',
  },
) {
  auth = markRaw(getAuth(useFirebaseApp()));

  if (emulator.enabled) {
    connectAuthEmulator(
      auth,
      emulator.url ?? 'http://localhost:9099',
    );
  }

  onAuthStateChanged(auth, (u) => {
    user.value = u;
  });

  return auth;
}
