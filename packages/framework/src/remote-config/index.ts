import { RemoteConfig, getRemoteConfig } from 'firebase/remote-config';

import { useFirebaseApp } from '../firebase';

let remoteConfig: RemoteConfig | null = null;

export function useRemoteConfig() {
  if (!remoteConfig) {
    throw new Error('You need to enable the remoteConfig feature before calling useRemoteConfig');
  }

  return remoteConfig;
}

export function initializeRemoteConfig() {
  remoteConfig = getRemoteConfig(useFirebaseApp());

  return remoteConfig;
}
