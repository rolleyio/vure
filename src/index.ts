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

// Currently don't need the Vue app to inject so basic function
export function install(options: VureConfig) {
  const { name, features, config } = options;

  initializeFirebaseApp(config, name);

  if (features.analytics) {
    initializeAnalytics();
  }

  if (features.appCheck) {
    const { provider, isTokenAutoRefreshEnabled } = features.appCheck;

    if (provider) {
      initializeAppCheck(provider, isTokenAutoRefreshEnabled);
    } else {
      throw new Error(
        'You need to provide a provider in features.appCheck config to enable appCheck',
      );
    }
  }

  if (features.auth) {
    initializeAuth(features.auth.emulator);
  }

  if (features.firestore) {
    initializeFirestore(features.firestore.emulator);
  }

  if (features.functions) {
    const { regionOrCustomDomain, emulator: fnsEmulator } =
      features.functions;

    initializeFunctions(regionOrCustomDomain, fnsEmulator);
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
    const { bucketUrl, emulator: storageEmulator } = features.storage;

    initializeStorage(bucketUrl, storageEmulator);
  }
}

// Have a basic vue plugin, just in case
export default {
  install(_: App, options: VureConfig) {
    install(options);
  },
};
