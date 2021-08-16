import type { App } from 'vue';

import { initializeAnalytics } from './analytics';
import { initializeAppCheck } from './app-check';
import { initializeAuth } from './auth';
import { initializeFirebaseApp } from './composables';
import { initializeFirestore } from './firestore';
import { initializeFunctions } from './functions';
import { initializeMessaging } from './messaging';
import { initializePerformance } from './performance';
import { initializeRemoteConfig } from './remote-config';
import { initializeStorage } from './storage';

import type { VureConfig } from './types';

export * from './analytics';
export * from './app-check';
export * from './auth';
export * from './composables';
export * from './firestore';
export * from './functions';
export * from './messaging';
export * from './performance';
export * from './remote-config';
export * from './storage';

export function defineVureConfig(options: VureConfig) {
  return options;
}

export default {
  install(_: App, options: VureConfig) {
    const { name, features, config } = options;

    initializeFirebaseApp(config, name);

    if (features.analytics) {
      initializeAnalytics();
    }

    if (features.appCheck) {
      const { provider, isTokenAutoRefreshEnabled } =
        features.appCheck;

      if (provider) {
        initializeAppCheck(provider, isTokenAutoRefreshEnabled);
      }
    }

    if (features.auth) {
      if (typeof features.auth === 'boolean') {
        initializeAuth();
      } else {
        initializeAuth(features.auth.emulator);
      }
    }

    if (features.firestore) {
      if (typeof features.firestore === 'boolean') {
        initializeFirestore();
      } else {
        initializeFirestore(features.firestore.emulator);
      }
    }

    if (features.functions) {
      if (typeof features.functions === 'boolean') {
        initializeFunctions();
      } else {
        initializeFunctions(
          features.functions.regionOrCustomDomain,
          features.functions.emulator,
        );
      }
    }

    if (features.messaging) {
      initializeMessaging();
    }

    if (features.performance) {
      initializePerformance();
    }

    if (features.remoteConfig) {
      initializeRemoteConfig();
    }

    if (features.storage) {
      if (typeof features.storage === 'boolean') {
        initializeStorage();
      } else {
        const { bucketUrl, emulator: storageEmulator } =
          features.storage;

        initializeStorage(bucketUrl, storageEmulator);
      }
    }
  },
};
