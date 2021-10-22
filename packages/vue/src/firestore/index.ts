import {
  onBeforeUnmount,
  ref,
  getCurrentInstance,
  watch,
  shallowRef,
  Ref,
} from 'vue';
import { z } from 'zod';

import firestoreSchema from '../../firestore/schema';
import { Doc } from '../../firestore/doc';
import { Query } from '../../firestore/onQuery';

type MaybeRef<T> = T | Ref<T>;

export function createRefs<T>(defaultValue: T) {
  return {
    loading: ref(true),
    result: shallowRef<T>(defaultValue),
    error: shallowRef<Error | null>(null),
  };
}

// FIX: A lot of repetitive code
// TODO: Write tests
export function refSchema<T>(
  collectionName: string,
  zodSchema?: Record<keyof T, z.Schema<T[keyof T]>>,
) {
  return () => {
    const schema = firestoreSchema(collectionName, zodSchema)();

    return {
      schema: schema,
      collection: schema.collection,
      collectionName: schema.collectionName,
      zod: schema.zod,
      parse: schema.parse,
      add: schema.add,
      remove: schema.remove,
      set: schema.set,
      save: schema.save,
      update: schema.update,
      upset: schema.upset,
      all() {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        schema
          .all()
          .then((r) => {
            result.value = r;
            error.value = null;
          })
          .catch((e) => {
            result.value = [];
            error.value = e;
          })
          .finally(() => {
            loading.value = false;
          });

        return { loading, result, error };
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
              result.value = await schema.get(watchedId);
              error.value = null;
            } catch (e) {
              result.value = null;
              error.value = e as Error;
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
      getInRadius(
        center: MaybeRef<[number, number]>,
        radiusInM: MaybeRef<number>,
        maxLimit = 5,
      ) {
        const { loading, result, error } = createRefs<Doc<T>[]>([]);

        const unwatch = watch(
          [ref(center), ref(radiusInM)],
          async ([watchedCenter, watchRadius]) => {
            loading.value = true;
            try {
              result.value = (await schema.getInRadius(
                watchedCenter,
                watchRadius,
                maxLimit,
              )) as unknown as Doc<T>[];
              error.value = null;
            } catch (e) {
              result.value = [];
              error.value = e as Error;
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
              result.value = await schema.getMany(
                watchedIds,
                onMissing,
              );
              error.value = null;
            } catch (e) {
              result.value = [];
              error.value = e as Error;
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

        const unwatch = schema.onAll(
          (r) => {
            loading.value = false;
            result.value = r;
            error.value = null;
          },
          (e) => {
            loading.value = false;
            result.value = [];
            error.value = e as Error;
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
        const { loading, result, error } = createRefs<Doc<T> | null>(
          null,
        );

        let unwatchOnGet: (() => void) | null = null;

        const unwatch = watch(
          ref(id),
          async (watchedId) => {
            if (unwatchOnGet) {
              unwatchOnGet();
            }

            unwatchOnGet = schema.onGet(
              watchedId,
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = null;
                error.value = e as Error;
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

            unwatchOnGetMany = schema.onGetMany(
              watchedIds,
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = [];
                error.value = e as Error;
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

            unwatchOnQuery = schema.onQuery(
              watchedQueries as Query<T, keyof T>[],
              (r) => {
                loading.value = false;
                result.value = r;
                error.value = null;
              },
              (e) => {
                loading.value = false;
                result.value = [];
                error.value = e as Error;
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
              result.value = await schema.query(
                watchedQueries as Query<T, keyof T>[],
              );
              error.value = null;
            } catch (e) {
              result.value = [];
              error.value = e as Error;
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
    };
  };
}
