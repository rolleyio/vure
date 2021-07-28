import type { FirebaseOptions } from 'firebase/app';

import type {
  CustomProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';

export type VureConfig = {
  name?: string;
  features: {
    analytics?: boolean;
    appCheck?: {
      provider: CustomProvider | ReCaptchaV3Provider;
      isTokenAutoRefreshEnabled?: boolean;
    };
    auth?: boolean;
    firestore?: boolean;
    functions?: boolean;
    messaging?: boolean;
    performance?: boolean;
    remoteConfig?: boolean;
    storage?: boolean;
  };
  config: FirebaseOptions;
};
