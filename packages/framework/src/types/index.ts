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
    auth?:
      | {
          emulator?: VureAuthEmulatorConfig;
        }
      | boolean;
    firestore?:
      | {
          emulator?: VureEmulatorConfig;
        }
      | boolean;
    functions?:
      | {
          regionOrCustomDomain?: string;
          emulator?: VureEmulatorConfig;
        }
      | boolean;
    messaging?: boolean;
    performance?: boolean;
    remoteConfig?: boolean;
    storage?:
      | {
          bucketUrl?: string;
          emulator?: VureEmulatorConfig;
        }
      | boolean;
  };
};
