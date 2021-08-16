import { ref, shallowRef, Ref } from 'vue';

export type Nullable<T> = T | null;
export type MaybeRef<T> = T | Ref<T>;
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export type ToRefsOptions<T> = {
  default: T;
  isResultRef?: boolean;
};

export function createRefs<T>(defaultValue: T) {
  return {
    loading: ref(true),
    result: shallowRef<T>(defaultValue),
    error: shallowRef<Error | null>(null),
  };
}

export function toRefs<
  T extends Promise<any>,
  R = Nullable<ThenArg<T>>,
>(promise: T, opts: ToRefsOptions<R>) {
  const { loading, result, error } = createRefs<R>(opts.default);

  promise
    .then((r) => {
      result.value = opts.isResultRef ? true : r;
      error.value = null;
    })
    .catch((e) => {
      result.value = opts.default;
      error.value = e;
    })
    .finally(() => {
      loading.value = false;
    });

  return { loading, result, error };
}
