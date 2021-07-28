import { markRaw } from 'vue';
import {
  initializeAppCheck as getAppCheck,
  AppCheck,
  CustomProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';

import { useFirebaseApp } from '../composables';

let appCheck: AppCheck | null = null;

export function useAppCheck() {
  if (!appCheck) {
    throw new Error(
      'You need to enable the appCheck feature before calling useAppCheck',
    );
  }

  return appCheck;
}

export function initializeAppCheck(
  provider: CustomProvider | ReCaptchaV3Provider,
  isTokenAutoRefreshEnabled?: boolean,
) {
  appCheck = markRaw(
    getAppCheck(useFirebaseApp(), {
      provider,
      isTokenAutoRefreshEnabled,
    }),
  );

  return appCheck;
}
