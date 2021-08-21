import { onBeforeUnmount, ref, getCurrentInstance, watch } from 'vue';
import { z } from 'zod';

import { createRefs, MaybeRef, toRefs } from './helpers';
import { useSchema } from './schema';

import type { Doc } from '../doc';
import type { Field } from '../field';
import type { Query } from '../onQuery';
import type { SetModel } from '../set';
import type { UpdateModel } from '../update';
import type { UpsetModel } from '../upset';

// FIX: A lot of repetitive code
// TODO: test this
export function useRefSchema<T>(
  collectionName: string,
  zod?: z.Schema<T>,
) {
  return () => {
    const schema = useSchema(collectionName, zod)();

    return {
      schema,
      collection: schema.collection,
      collectionName: schema.collectionName,
      zod: schema.zod,
      add(data: T) {
        return toRefs(schema.add(data), {
          default: null as Nullable<Doc<T>>,
        });
      },
      all() {
        return toRefs(schema.all(), {
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
              result.value = await schema.get(watchedId);
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
              )) as any;
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

        const unwatch = schema.onAll(
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

            unwatchOnQuery = schema.onQuery(
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
              result.value = await schema.query(
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
        return toRefs(schema.remove(id), {
          default: false,
          isResultRef: true,
        });
      },
      set(id: string, data: SetModel<T>) {
        return toRefs(schema.set(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      update(id: string, data: UpdateModel<T> | Field<T>[]) {
        return toRefs(schema.update(id, data), {
          default: false,
          isResultRef: true,
        });
      },
      upset(id: string, data: UpsetModel<T>) {
        return toRefs(schema.upset(id, data), {
          default: false,
          isResultRef: true,
        });
      },
    };
  };
}
