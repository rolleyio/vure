import { ref, shallowRef } from 'vue';
import { z } from 'zod';

import { collection as vureCollection } from '../collection';
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

// TODO: Add schema definitions
// TODO: Better types
// TODO: A lot of repetitive code
// TODO: Better createRefs and toRefs function
// TODO: Add cleanup to onEvents

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type Nullable<T> = T | null;

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
>(promise: T, defaultValue: R, isResultRef = false) {
  const { loading, result, error } = createRefs<R>(defaultValue);

  promise
    .then((r) => {
      result.value = isResultRef ? true : r;
      error.value = null;
    })
    .catch((e) => {
      result.value = defaultValue;
      error.value = e;
    })
    .finally(() => {
      loading.value = false;
    });

  return { loading, result, error };
}

export function useModel<Model>(
  collection: string,
  schema?: z.Schema<Model>,
) {
  return () => {
    const modelCollection = vureCollection<Model>(collection);

    return {
      schema,
      collection: modelCollection,
      add(data: Model) {
        return toRefs(
          this.addAsync(data),
          null as Nullable<Doc<Model>>,
        );
      },
      addAsync(data: Model) {
        return add(modelCollection, data);
      },
      all() {
        return toRefs(this.allAsync(), [] as Doc<Model>[]);
      },
      allAsync() {
        return all(modelCollection);
      },
      get(id: string) {
        return toRefs(
          this.getAsync(id),
          null as Nullable<Doc<Model>>,
        );
      },
      getAsync(id: string) {
        return get(modelCollection, id);
      },
      getMany(
        ids: string[],
        onMissing?: 'ignore' | ((id: string) => Model),
      ) {
        return toRefs(
          this.getManyAsync(ids, onMissing),
          [] as Doc<Model>[],
        );
      },
      getManyAsync(
        ids: string[],
        onMissing?: 'ignore' | ((id: string) => Model),
      ) {
        return getMany(modelCollection, ids, onMissing);
      },
      onAll() {
        const { loading, result, error } = createRefs<Doc<Model>[]>(
          [],
        );

        onAll(
          modelCollection,
          (r) => {
            loading.value = false;
            result.value = r;
          },
          (e) => {
            error.value = e;
          },
        );

        return { loading, result, error };
      },
      onGet(id: string) {
        const { loading, result, error } =
          createRefs<Nullable<Doc<Model>>>(null);

        onGet(
          modelCollection,
          id,
          (r) => {
            loading.value = false;
            result.value = r;
          },
          (e) => {
            error.value = e;
          },
        );

        return { loading, result, error };
      },
      onGetMany(ids: string[]) {
        const { loading, result, error } = createRefs<Doc<Model>[]>(
          [],
        );

        onGetMany(
          modelCollection,
          ids,
          (r) => {
            loading.value = false;
            result.value = r;
          },
          (e) => {
            error.value = e;
          },
        );

        return { loading, result, error };
      },
      onQuery(queries: Query<Model, keyof Model>[]) {
        const { loading, result, error } = createRefs<Doc<Model>[]>(
          [],
        );

        onQuery(
          modelCollection,
          queries,
          (r) => {
            loading.value = false;
            result.value = r;
          },
          (e) => {
            error.value = e;
          },
        );

        return { loading, result, error };
      },
      query(queries: Query<Model, keyof Model>[]) {
        return toRefs(this.queryAsync(queries), [] as Doc<Model>[]);
      },
      queryAsync(queries: Query<Model, keyof Model>[]) {
        return query(modelCollection, queries);
      },
      remove(id: string) {
        return toRefs(this.removeAsync(id), false, true);
      },
      removeAsync(id: string) {
        return remove(modelCollection, id);
      },
      set(id: string, data: SetModel<Model>) {
        return toRefs(this.setAsync(id, data), false, true);
      },
      setAsync(id: string, data: SetModel<Model>) {
        return set(modelCollection, id, data);
      },
      update(id: string, data: UpdateModel<Model> | Field<Model>[]) {
        return toRefs(this.updateAsync(id, data), false, true);
      },
      updateAsync(
        id: string,
        data: UpdateModel<Model> | Field<Model>[],
      ) {
        return update(modelCollection, id, data);
      },
      upset(id: string, data: UpsetModel<Model>) {
        return toRefs(this.upsetAsync(id, data), false, true);
      },
      upsetAsync(id: string, data: UpsetModel<Model>) {
        return upset(modelCollection, id, data);
      },
    };
  };
}
