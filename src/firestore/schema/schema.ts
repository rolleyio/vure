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
import { SnapshotInfo } from '../snapshot';
import getInRadius from '../getInRadius';
import { useRefSchema } from './ref';

// TODO: Add zod schema definitions (better to add validation to methods like add, set etc now)
export function useSchema<T>(
  collectionName: string,
  zod?: z.Schema<T>,
) {
  return () => {
    const collection = vCollection<T>(collectionName);

    return {
      collectionName,
      collection,
      zod,
      refs: useRefSchema<T>(collectionName, zod),
      add(data: T) {
        return add(collection, data);
      },
      all() {
        return all(collection);
      },
      get(id: string) {
        return get(collection, id);
      },
      getInRadius(
        center: [number, number],
        radiusInM: number,
        maxLimit = 5,
      ) {
        return getInRadius(
          collection,
          center,
          radiusInM,
          maxLimit,
        ) as unknown as Promise<Doc<T>[]>;
      },
      getMany(
        ids: string[],
        onMissing?: 'ignore' | ((id: string) => T),
      ) {
        return getMany(collection, ids, onMissing);
      },
      onAll(
        onResult: (docs: Doc<T>[], info: SnapshotInfo<T>) => any,
        onError?: (error: Error) => any,
      ) {
        return onAll(collection, onResult, onError);
      },
      onGet(
        id: string,
        onResult: (doc: Doc<T> | null) => any,
        onError?: (error: Error) => any,
      ) {
        return onGet(collection, id, onResult, onError);
      },
      onGetMany(
        ids: string[],
        onResult: (docs: Doc<T>[]) => any,
        onError?: (error: Error) => any,
      ) {
        return onGetMany(collection, ids, onResult, onError);
      },
      onQuery(
        queries: Query<T, keyof T>[],
        onResult: (docs: Doc<T>[]) => any,
        onError?: (error: Error) => any,
      ) {
        return onQuery(collection, queries, onResult, onError);
      },
      query(queries: Query<T, keyof T>[]) {
        return query(collection, queries);
      },
      remove(id: string) {
        return remove(collection, id);
      },
      set(id: string, data: SetModel<T>) {
        return set(collection, id, data);
      },
      update(id: string, data: UpdateModel<T> | Field<T>[]) {
        return update(collection, id, data);
      },
      upset(id: string, data: UpsetModel<T>) {
        return upset(collection, id, data);
      },
    };
  };
}
