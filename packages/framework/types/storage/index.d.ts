import { FirebaseStorage, UploadMetadata } from 'firebase/storage';
import type { VureEmulatorConfig } from '../types';
export declare function useStorage(): FirebaseStorage;
export declare function initializeStorage(bucketUrl?: string, emulator?: VureEmulatorConfig): FirebaseStorage;
export declare function uploadFile(path: string, file: File | Blob, metadata?: UploadMetadata): import("firebase/storage").UploadTask;
