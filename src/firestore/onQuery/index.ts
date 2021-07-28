import {
  documentId,
  limit,
  where,
  orderBy,
  CollectionReference,
  Query as FirestoreQuery,
  query as fQuery,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';

import { Collection } from '../collection';
import { Cursor, CursorMethod } from '../cursor';
import { unwrapData, wrapData } from '../data';
import { doc, Doc } from '../doc';
import { DocId } from '../docId';
import { CollectionGroup } from '../group';
import { LimitQuery } from '../limit';
import { OrderQuery } from '../order';
import { pathToRef, ref } from '../ref';
import { WhereQuery } from '../where';
import { SnapshotInfo } from '../snapshot';
import { getDocMeta } from '../utils';

type FirebaseQuery = CollectionReference | FirestoreQuery;

// TODO: Refactor with query

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery;

/**
 * Subscribes to a collection query built using query objects ({@link order | order}, {@link where | where}, {@link limit | limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onQuery(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ], bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 *   console.log(bornAfter2000[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(bornAfter2000[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection or collection group to query
 * @param queries - The query objects
 * @param onResult - The function which is called with the query result when
 * the initial fetch is resolved or the query result updates.
 * @param onError - The function is called with error when request fails.
 * @returns Function that unsubscribes the listener from the updates
 */
export default function onQuery<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
  onResult: (docs: Doc<Model>[], info: SnapshotInfo<Model>) => any,
  onError?: (err: Error) => any,
): () => void {
  let firebaseUnsub: () => void;
  const unsub = () => {
    firebaseUnsub && firebaseUnsub();
  };

  const { firestoreQuery, cursors } = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method, cursors } = q;

          acc.firestoreQuery = fQuery(
            collection.path,
            orderBy(
              field instanceof DocId
                ? documentId()
                : field.toString(),
              method,
            ),
          );

          if (cursors)
            acc.cursors = acc.cursors.concat(
              cursors.map(({ method, value }) => ({
                method,
                value:
                  typeof value === 'object' &&
                  value !== null &&
                  '__type__' in value &&
                  value.__type__ === 'doc'
                    ? field instanceof DocId
                      ? value.ref.id
                      : value.data[field]
                    : value,
              })),
            );
          break;
        }

        case 'where': {
          const { field, filter, value } = q;
          const fieldName = Array.isArray(field)
            ? field.join('.')
            : field;

          acc.firestoreQuery = fQuery(
            collection.path,
            where(
              fieldName instanceof DocId ? documentId() : fieldName,
              filter,
              unwrapData(value),
            ),
          );
          break;
        }

        case 'limit': {
          const { number } = q;
          acc.firestoreQuery = fQuery(collection.path, limit(number));
          break;
        }
      }

      return acc;
    },
    {
      firestoreQuery: collection.path as unknown as FirebaseQuery,
      cursors: [],
    } as {
      firestoreQuery: FirebaseQuery;
      cursors: Cursor<Model, keyof Model>[];
    },
  );

  const groupedCursors = cursors.reduce((acc, cursor) => {
    let methodValues = acc.find(
      ([method]) => method === cursor.method,
    );
    if (!methodValues) {
      methodValues = [cursor.method, []];
      acc.push(methodValues);
    }
    methodValues[1].push(unwrapData(cursor.value));
    return acc;
  }, [] as [CursorMethod, any[]][]);

  const paginatedFirestoreQuery =
    cursors.length &&
    cursors.every((cursor) => cursor.value !== undefined)
      ? groupedCursors.reduce((acc, [method, values]) => {
          // TODO: Fix
          return (acc as any)[method](...values);
        }, firestoreQuery)
      : firestoreQuery;

  firebaseUnsub = onSnapshot(
    paginatedFirestoreQuery,
    (firestoreSnap: QuerySnapshot) => {
      const docs: Doc<Model>[] = firestoreSnap.docs.map((snap) =>
        doc(
          collection.__type__ === 'collectionGroup'
            ? pathToRef(snap.ref.path)
            : ref(collection, snap.id),
          wrapData(snap.data()) as Model,
          getDocMeta(snap as any),
        ),
      );

      const changes = () =>
        firestoreSnap.docChanges().map((change) => ({
          type: change.type,
          oldIndex: change.oldIndex,
          newIndex: change.newIndex,
          doc:
            docs[
              change.type === 'removed'
                ? change.oldIndex
                : change.newIndex
            ] ||
            // If change.type indicates 'removed', sometimes(not all the time) `docs` does not
            // contain the removed document. In that case, we'll restore it from `change.doc`:
            doc(
              collection.__type__ === 'collectionGroup'
                ? pathToRef(change.doc.ref.path)
                : ref(collection, change.doc.id),
              wrapData(change.doc.data()) as Model,
              getDocMeta(change.doc as any),
            ),
        }));
      onResult(docs, {
        changes,
        size: firestoreSnap.size,
        empty: firestoreSnap.empty,
      });
    },
    onError,
  );

  return unsub;
}
