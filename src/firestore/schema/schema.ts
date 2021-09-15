import { z } from 'zod';

import { collection as vCollection } from '../collection';
import add from '../add';
import all from '../all';
import { Doc } from '../doc';
import { Field } from '../field';
import get from '../get';
import getInRadius from '../getInRadius';
import getMany from '../getMany';
import onAll from '../onAll';
import onGet from '../onGet';
import onGetMany from '../onGetMany';
import onQuery, { Query } from '../onQuery';
import { query } from '../query';
import remove from '../remove';
import { SnapshotInfo } from '../snapshot';
import set, { SetModel } from '../set';
import update, { UpdateModel } from '../update';
import upset, { UpsetModel } from '../upset';

// TODO: Add zod schema definitions (better to add validation to methods like add, set etc now)
export function useSchema<T>(
  collectionName: string,
  zod?: z.Schema<T>,
) {
  return () => {
    const collection = vCollection<T>(collectionName);

    // methods to allow function overloading
    function instanceRemove(id: string): Promise<void>;
    function instanceRemove(id: Doc<T>): Promise<void>;
    function instanceRemove(id: string | Doc<T>) {
      if (typeof id === 'string') {
        return remove(collection, id);
      } else {
        return remove(id.ref);
      }
    }

    function instanceSet(
      id: string,
      data: SetModel<T>,
    ): Promise<void>;
    function instanceSet(model: Doc<T>): Promise<void>;
    function instanceSet(
      modelOrId: string | Doc<T>,
      data?: SetModel<T>,
    ) {
      if (typeof modelOrId === 'string') {
        if (!data) {
          throw new Error(
            'Need to pass data if only passing ID as string',
          );
        }
        return set(collection, modelOrId, data);
      } else {
        return set(modelOrId.ref, modelOrId.data);
      }
    }

    function instanceUpdate(
      id: string,
      data: UpdateModel<T> | Field<T>[],
    ): Promise<void>;
    function instanceUpdate(model: Doc<T>): Promise<void>;
    function instanceUpdate(
      modelOrId: string | Doc<T>,
      data?: UpdateModel<T> | Field<T>[],
    ) {
      if (typeof modelOrId === 'string') {
        if (!data) {
          throw new Error(
            'Need to pass data if only passing ID as string',
          );
        }

        return update(collection, modelOrId, data);
      } else {
        return update(modelOrId.ref, modelOrId.data);
      }
    }

    function instanceUpset(
      id: string,
      data: UpsetModel<T>,
    ): Promise<void>;
    function instanceUpset(model: Doc<T>): Promise<void>;
    function instanceUpset(
      modelOrId: string | Doc<T>,
      data?: UpsetModel<T>,
    ) {
      if (typeof modelOrId === 'string') {
        if (!data) {
          throw new Error(
            'Need to pass data if only passing ID as string',
          );
        }

        return upset(collection, modelOrId, data);
      } else {
        return upset(modelOrId.ref, modelOrId.data);
      }
    }

    return {
      collectionName,
      collection,
      zod,
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
      remove: instanceRemove,
      set: instanceSet,
      update: instanceUpdate,
      upset: instanceUpset,
    };
  };
}
