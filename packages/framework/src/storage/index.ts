import {
  FirebaseStorage,
  connectStorageEmulator,
  getStorage,
  uploadBytesResumable,
  ref as storageRef,
  UploadMetadata,
} from 'firebase/storage';

import { useFirebaseApp } from '../firebase';
import type { VureEmulatorConfig } from '../types';

let storage: FirebaseStorage | null = null;

export function useStorage() {
  if (!storage) {
    throw new Error('You need to enable the storage feature before calling useStorage');
  }

  return storage;
}

export function initializeStorage(
  bucketUrl?: string,
  emulator: VureEmulatorConfig = {
    enabled: false,
    host: 'localhost',
    port: 9199,
  },
) {
  storage = getStorage(useFirebaseApp(), bucketUrl);

  if (emulator.enabled) {
    connectStorageEmulator(storage, emulator.host ?? 'localhost', emulator.port ?? 9199);
  }

  return storage;
}

export function uploadFile(path: string, file: File | Blob, metadata?: UploadMetadata) {
  return uploadBytesResumable(storageRef(useStorage(), path), file, metadata);
}
