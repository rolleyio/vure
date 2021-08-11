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
    const { name, features, config, emulators } = options;

    initializeFirebaseApp(config, name);

    if (features.analytics) {
      if (config.measurementId) {
        initializeAnalytics();
      } else {
        throw new Error(
          'You need to provide a measurementId in your options config to enable analytics',
        );
      }
    }

    if (features.appCheck) {
      const { provider, isTokenAutoRefreshEnabled } =
        features.appCheck;

      if (provider) {
        initializeAppCheck(provider, isTokenAutoRefreshEnabled);
      } else {
        throw new Error(
          'You need to provide a provider in features.appCheck config to enable appCheck',
        );
      }
    }

    if (features.auth) {
      if (config.authDomain) {
        initializeAuth(emulators?.auth);
      } else {
        throw new Error(
          'You need to provide an authDomain in your options config to enable auth',
        );
      }
    }

    if (features.firestore) {
      initializeFirestore(emulators?.firestore);
    }

    if (features.functions) {
      const { enabled, regionOrCustomDomain } = features.functions;

      if (enabled) {
        initializeFunctions(
          regionOrCustomDomain,
          emulators?.functions,
        );
      }
    }

    if (features.messaging) {
      if (config.messagingSenderId) {
        initializeMessaging();
      } else {
        throw new Error(
          'You need to provide an messagingSenderId in your options config to enable messaging',
        );
      }
    }

    if (features.performance) {
      initializePerformance();
    }

    if (features.remoteConfig) {
      initializeRemoteConfig();
    }

    if (features.storage) {
      const { enabled, bucketUrl } = features.storage;

      if (enabled) {
        initializeStorage(bucketUrl, emulators?.storage);
      }
    }
  },
};
