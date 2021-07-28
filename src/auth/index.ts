import { ref, Ref, markRaw } from 'vue';
import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  useAuthEmulator,
} from 'firebase/auth';

import { useFirebaseApp } from '../composables';

let auth: Auth | null = null;
// TODO: this might need to be injected to keep reactive
let user: Ref<User | null> = ref(null);

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

export function initializeAuth() {
  auth = markRaw(getAuth(useFirebaseApp()));

  if (import.meta.env.DEV) {
    useAuthEmulator(auth, 'http://localhost:9099');
  }

  onAuthStateChanged(auth, (u) => {
    user.value = u;
  });

  return auth;
}
