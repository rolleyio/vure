import type { FirebaseOptions } from 'firebase/app';

import type {
  CustomProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';

export type VureAuthEmulatorConfig = {
  enabled: boolean;
  url?: string;
};

export type VureEmulatorConfig = {
  enabled: boolean;
  host?: string;
  port?: number;
};

export type VureConfig = {
  name?: string;
  config: FirebaseOptions;
  features: {
    analytics?: boolean;
    appCheck?: {
      provider: CustomProvider | ReCaptchaV3Provider;
      isTokenAutoRefreshEnabled?: boolean;
    };
    auth?: boolean;
    firestore?: boolean;
    functions?: {
      enabled: boolean;
      regionOrCustomDomain: string | undefined;
    };
    messaging?: boolean;
    performance?: boolean;
    remoteConfig?: boolean;
    storage?: {
      enabled: boolean;
      bucketUrl: string | undefined;
    };
  };
  emulators?: {
    auth?: VureAuthEmulatorConfig;
    firestore?: VureEmulatorConfig;
    functions?: VureEmulatorConfig;
    storage?: VureEmulatorConfig;
  };
};
