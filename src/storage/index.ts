import {
  FirebaseStorage,
  connectStorageEmulator,
  getStorage,
  uploadBytesResumable,
  ref as storageRef,
  UploadMetadata,
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { markRaw, ref, shallowRef } from 'vue';

import { useFirebaseApp } from '../composables';

import type { VureEmulatorConfig } from '../types';

let storage: FirebaseStorage | null = null;

export function useStorage() {
  if (!storage) {
    throw new Error(
      'You need to enable the storage feature before calling useStorage',
    );
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
  storage = markRaw(getStorage(useFirebaseApp(), bucketUrl));

  if (emulator.enabled) {
    connectStorageEmulator(
      storage,
      emulator.host ?? 'localhost',
      emulator.port ?? 9199,
    );
  }

  return storage;
}

export function getUploadProgress(snapshot: UploadTaskSnapshot) {
  return (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
}

export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
) {
  const storage = useStorage();
  const r = storageRef(storage, path);

  const progress = ref(0);
  const result = ref('');
  const snapshot = shallowRef<UploadTaskSnapshot | null>(null);
  const error = shallowRef<Error | null>(null);

  const uploadTask = markRaw(uploadBytesResumable(r, file, metadata));

  uploadTask.on(
    'state_changed',
    (s) => {
      snapshot.value = s;
      progress.value = getUploadProgress(snapshot.value);
    },
    (e) => {
      error.value = e;
    },
    async () => {
      result.value = await getDownloadURL(uploadTask.snapshot.ref);
    },
  );

  return {
    uploadTask,
    progress,
    snapshot,
    result,
    error,
  };
}
