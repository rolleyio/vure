import { ref, shallowRef } from 'vue';
import { getDownloadURL } from 'firebase/storage';
import type {
  UploadMetadata,
  UploadTaskSnapshot,
} from 'firebase/storage';

import { uploadFile } from '../../storage';

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
