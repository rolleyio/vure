import { AppCheck, CustomProvider, ReCaptchaV3Provider } from 'firebase/app-check';
export declare function useAppCheck(): AppCheck;
export declare function initializeAppCheck(provider: CustomProvider | ReCaptchaV3Provider, isTokenAutoRefreshEnabled?: boolean): AppCheck;
