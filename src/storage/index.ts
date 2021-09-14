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

export function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
) {
  return markRaw(
    uploadBytesResumable(
      storageRef(useStorage(), path),
      file,
      metadata,
    ),
  );
}

export function useFileUpload() {
  const progress = ref<number[]>([]);
  const result = ref<string[]>([]);
  const snapshot = shallowRef<(UploadTaskSnapshot | null)[]>([]);
  const error = shallowRef<(Error | null)[]>([]);

  function upload(
    path: string,
    file: File | Blob,
    metadata?: UploadMetadata,
  ) {
    const uploadTask = uploadFile(path, file, metadata);
    const index = progress.value.length;

    uploadTask.on(
      'state_changed',
      (s) => {
        snapshot.value[index] = s;
        progress.value[index] =
          (s.bytesTransferred / s.totalBytes) * 100;
      },
      (e) => {
        error.value[index] = e;
      },
      async () => {
        result.value[index] = await getDownloadURL(
          uploadTask.snapshot.ref,
        );
      },
    );

    return { task: uploadTask, i: index };
  }

  return {
    upload,
    progress,
    snapshot,
    result,
    error,
  };
}
