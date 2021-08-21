import { onBeforeUnmount, ref, getCurrentInstance, watch } from 'vue';
import { z } from 'zod';

import { createRefs, MaybeRef, toRefs } from './helpers';
import { useAsyncSchema } from './async';

import type { Doc } from '../doc';
import type { Field } from '../field';
import type { Query } from '../onQuery';
import type { SetModel } from '../set';
import type { UpdateModel } from '../update';
import type { UpsetModel } from '../upset';

// FIX: A lot of repetitive code
// TEST: this
export function useSchema<T>(
  collectionName: string,
  schema?: z.Schema<T>,
) {
  return () => {
    const async = useAsyncSchema(collectionName, schema)();

    return {
      async,
      collection: async.collection,
      collectionName: async.collectionName,
      schema: async.schema,
      add(data: T) {
        return toRefs(async.add(data), {
          default: null as Nullable<Doc<T>>,
        });
      },
      all() {
        return toRefs(async.all(), {
          default: [] as Doc<T>[],
        });
      },
      get(id: MaybeRef<string>) {
        const { loading, result, error } = createRefs<Doc<T> | null>(
          null,
        );

        const unwatch = watch(
          ref(id),
          async (watchedId) => {
            loading.value = true;
            try {
              result.value = await async.get(watchedId);
              error.value = null;
            } catch (e) {
              result.value = null;
              error.value = e;
            } finally {
              loading.value = false;
            }
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      getMany(
        ids: MaybeRef<string[]>,
        onMissing?: 'ignore' | ((id: string) => T),
      ) {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        const unwatch = watch(
          ref(ids),
          async (watchedIds) => {
            loading.value = true;
            try {
              result.value = await async.getMany(
                watchedIds,
                onMissing,
              );
              error.value = null;
            } catch (e) {
              result.value = [];
              error.value = e;
            } finally {
              loading.value = false;
            }
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      onAll() {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        const unwatch = async.onAll(
          (r) => {
            loading.value = false;
            result.value = r;
            error.value = null;
          },
          (e) => {
            loading.value = false;
            result.value = [];
            error.value = e;
          },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      onGet(id: MaybeRef<string>) {
        const { loading, result, error } =
          createRefs<Nullable<Doc<T>>>(null);

        let unwatchOnGet: (() => void) | null = null;

        const unwatch = watch(
          ref(id),
          async (watchedId) => {
            if (unwatchOnGet) {
              unwatchOnGet();
            }

            unwatchOnGet = async.onGet(
              watchedId,
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = null;
                error.value = e;
              },
            );
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            if (unwatchOnGet) {
              unwatchOnGet();
            }

            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      onGetMany(ids: MaybeRef<string[]>) {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        let unwatchOnGetMany: (() => void) | null = null;

        const unwatch = watch(
          ref(ids),
          async (watchedIds) => {
            if (unwatchOnGetMany) {
              unwatchOnGetMany();
            }

            unwatchOnGetMany = async.onGetMany(
              watchedIds,
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = [];
                error.value = e;
              },
            );
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            if (unwatchOnGetMany) {
              unwatchOnGetMany();
            }

            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      onQuery(queries: MaybeRef<Query<T, keyof T>[]>) {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        let unwatchOnQuery: (() => void) | null = null;

        const unwatch = watch(
          ref(queries),
          async (watchedQueries) => {
            if (unwatchOnQuery) {
              unwatchOnQuery();
            }

            unwatchOnQuery = async.onQuery(
              watchedQueries as any,
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = [];
                error.value = e;
              },
            );
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            if (unwatchOnQuery) {
              unwatchOnQuery();
            }

            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      query(queries: MaybeRef<Query<T, keyof T>[]>) {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        const unwatch = watch(
          ref(queries),
          async (watchedQueries) => {
            loading.value = true;
            try {
              result.value = await async.query(watchedQueries as any);
              error.value = null;
            } catch (e) {
              result.value = [];
              error.value = e;
            } finally {
              loading.value = false;
            }
          },
          { immediate: true },
        );

        const currentInstance = getCurrentInstance();

        if (currentInstance) {
          onBeforeUnmount(() => {
            unwatch();
          }, currentInstance);
        }

        return { loading, result, error };
      },
      remove(id: string) {
        return toRefs(async.remove(id), {
          default: false,
          isResultRef: true,
        });
      },
      set(id: string, data: SetModel<T>) {
        return toRefs(async.set(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      update(id: string, data: UpdateModel<T> | Field<T>[]) {
        return toRefs(async.update(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      upset(id: string, data: UpsetModel<T>) {
        return toRefs(async.upset(id, data), {
          default: false,
          isResultRef: true,
        });
      },
    };
  };
}
