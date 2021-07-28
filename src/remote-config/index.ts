import {
  RemoteConfig,
  getRemoteConfig,
} from 'firebase/remote-config';
import { markRaw } from 'vue';

import { useFirebaseApp } from '../composables';

let remoteConfig: RemoteConfig | null = null;

export function useRemoteConfig() {
  if (!remoteConfig) {
    throw new Error(
      'You need to enable the remoteConfig feature before calling useRemoteConfig',
    );
  }

  return remoteConfig;
}

export function initializeRemoteConfig() {
  remoteConfig = markRaw(getRemoteConfig(useFirebaseApp()));

  return remoteConfig;
}
