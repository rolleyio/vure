import { onBeforeUnmount, ref, getCurrentInstance, watch } from 'vue';
import { z } from 'zod';

import { createRefs, MaybeRef, toRefs } from './helpers';
import { useAsyncSchema } from './asyncSchema';

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
    const asyncSchema = useAsyncSchema(collectionName, schema)();

    return {
      collection: asyncSchema.collection,
      collectionName: asyncSchema.collectionName,
      schema: asyncSchema.schema,
      async: asyncSchema,
      add(data: T) {
        return toRefs(asyncSchema.add(data), {
          default: null as Nullable<Doc<T>>,
        });
      },
      all() {
        return toRefs(asyncSchema.all(), {
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
              result.value = await asyncSchema.get(watchedId);
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
              result.value = await asyncSchema.getMany(
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

        const unwatch = asyncSchema.onAll(
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

            unwatchOnGet = asyncSchema.onGet(
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

            unwatchOnGetMany = asyncSchema.onGetMany(
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

            unwatchOnQuery = asyncSchema.onQuery(
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
              result.value = await asyncSchema.query(
                watchedQueries as any,
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
      remove(id: string) {
        return toRefs(asyncSchema.remove(id), {
          default: false,
          isResultRef: true,
        });
      },
      set(id: string, data: SetModel<T>) {
        return toRefs(asyncSchema.set(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      update(id: string, data: UpdateModel<T> | Field<T>[]) {
        return toRefs(asyncSchema.update(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      upset(id: string, data: UpsetModel<T>) {
        return toRefs(asyncSchema.upset(id, data), {
          default: false,
          isResultRef: true,
        });
      },
    };
  };
}
