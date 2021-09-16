import type { App } from 'vue';
import type { VureConfig } from '../types';
import setupFirebaseApp from '../';

export * from './firestore';
export * from './storage';

export function defineVureConfig(options: VureConfig) {
  return options;
}

export default {
  install(_: App, options: VureConfig) {
    setupFirebaseApp(options);
  },
};
