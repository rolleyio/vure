import {
  onBeforeUnmount,
  ref,
  shallowRef,
  getCurrentInstance,
  Ref,
  watch,
} from 'vue';
import { z } from 'zod';

import { Collection, collection } from '../collection';
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

type Nullable<T> = T | null;
type MaybeRef<T> = T | Ref<T>;
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type ToRefsOptions<T> = {
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

// TODO: Add zod schema definitions
// FIX: A lot of repetitive code
export class Model<T> {
  public collection: Collection<T>;

  constructor(
    public collectionName: string,
    public schema?: z.Schema<T>,
  ) {
    this.collection = collection<T>(collectionName);
  }

  public add(data: T) {
    return toRefs(add(this.collection, data), {
      default: null as Nullable<Doc<T>>,
    });
  }

  public all() {
    return toRefs(all(this.collection), {
      default: [] as Doc<T>[],
    });
  }

  public get(id: MaybeRef<string>) {
    const { loading, result, error } = createRefs<Doc<T> | null>(
      null,
    );

    const unwatch = watch(
      ref(id),
      async (watchedId) => {
        loading.value = true;
        try {
          result.value = await get(this.collection, watchedId);
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
  }

  public getMany(
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
            this.collection,
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
  }

  public onAll() {
    const { loading, result, error } = createRefs<Doc<T>[]>([]);

    const unwatch = onAll(
      this.collection,
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
  }

  public onGet(id: MaybeRef<string>) {
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
          this.collection,
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
  }

  public onGetMany(ids: MaybeRef<string[]>) {
    const { loading, result, error } = createRefs<Doc<T>[]>([]);

    let unwatchOnGetMany: (() => void) | null = null;

    const unwatch = watch(
      ref(ids),
      async (watchedIds) => {
        if (unwatchOnGetMany) {
          unwatchOnGetMany();
        }

        unwatchOnGetMany = onGetMany(
          this.collection,
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
  }

  public onQuery(queries: MaybeRef<Query<T, keyof T>[]>) {
    const { loading, result, error } = createRefs<Doc<T>[]>([]);

    let unwatchOnQuery: (() => void) | null = null;

    const unwatch = watch(
      ref(queries),
      async (watchedQueries) => {
        if (unwatchOnQuery) {
          unwatchOnQuery();
        }

        unwatchOnQuery = onQuery(
          this.collection,
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
  }

  public query(queries: MaybeRef<Query<T, keyof T>[]>) {
    const { loading, result, error } = createRefs<Doc<T>[]>([]);

    const unwatch = watch(
      ref(queries),
      async (watchedQueries) => {
        loading.value = true;
        try {
          result.value = await query(
            this.collection,
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
  }

  public remove(id: string) {
    return toRefs(remove(this.collection, id), {
      default: false,
      isResultRef: true,
    });
  }

  public set(id: string, data: SetModel<T>) {
    return toRefs(set(this.collection, id, data), {
      default: false,
      isResultRef: true,
    });
  }

  public update(id: string, data: UpdateModel<T> | Field<T>[]) {
    return toRefs(update(this.collection, id, data), {
      default: false,
      isResultRef: true,
    });
  }

  public upset(id: string, data: UpsetModel<T>) {
    return toRefs(upset(this.collection, id, data), {
      default: false,
      isResultRef: true,
    });
  }
}

export function useModel<T>(
  collection: string,
  schema?: z.Schema<T>,
) {
  return () => new Model<T>(collection, schema);
}
