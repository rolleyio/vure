import { onBeforeUnmount, ref, getCurrentInstance, watch } from 'vue';
import { z } from 'zod';

import { collection as vCollection } from '../collection';
import add from '../add';
import all from '../all';
import { Doc } from '../doc';
import { Field } from '../field';
import get from '../get';
import getMany from '../getMany';
import onAll from '../onAll';
import onGet from '../onGet';
import onGetMany from '../onGetMany';
import onQuery, { Query } from '../onQuery';
import { query } from '../query';
import remove from '../remove';
import set, { SetModel } from '../set';
import update, { UpdateModel } from '../update';
import upset, { UpsetModel } from '../upset';
import getInRadius from '../getInRadius';

import { createRefs, MaybeRef, toRefs } from './helpers';

// FIX: A lot of repetitive code
// TODO: test this
export function useRefSchema<T>(
  collectionName: string,
  zod?: z.Schema<T>,
) {
  return () => {
    const collection = vCollection<T>(collectionName);

    return {
      collection: collection,
      collectionName: collectionName,
      zod: zod,
      add(data: T) {
        return toRefs(add(collection, data), {
          default: null as Nullable<Doc<T>>,
        });
      },
      all() {
        return toRefs(all(collection), {
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
              result.value = await get(collection, watchedId);
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
              result.value = (await getInRadius(
                collection,
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
              result.value = await getMany(
                collection,
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

        const unwatch = onAll(
          collection,
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

            unwatchOnGet = onGet(
              collection,
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

            unwatchOnGetMany = onGetMany(
              collection,
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

            unwatchOnQuery = onQuery(
              collection,
              watchedQueries as Query<T, keyof T>[],
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
              result.value = await query(
                collection,
                watchedQueries as Query<T, keyof T>[],
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
        return toRefs(remove(collection, id), {
          default: false,
          isResultRef: true,
        });
      },
      set(id: string, data: SetModel<T>) {
        return toRefs(set(collection, id, data), {
          default: false,
          isResultRef: true,
        });
      },
      update(id: string, data: UpdateModel<T> | Field<T>[]) {
        return toRefs(update(collection, id, data), {
          default: false,
          isResultRef: true,
        });
      },
      upset(id: string, data: UpsetModel<T>) {
        return toRefs(upset(collection, id, data), {
          default: false,
          isResultRef: true,
        });
      },
    };
  };
}
