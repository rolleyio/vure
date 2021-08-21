import {
  limit,
  where,
  orderBy,
  CollectionReference,
  Query as FirestoreQuery,
  query as fQuery,
  getDocs,
  QueryConstraint,
  startAfter,
  startAt,
  endBefore,
  endAt,
} from 'firebase/firestore';

import {
  Collection,
  collectionToFirestoreCollection,
} from '../collection';
import { doc, Doc } from '../doc';
import { ref, pathToRef } from '../ref';
import { WhereQuery } from '../where';
import { OrderQuery } from '../order';
import { LimitQuery } from '../limit';
import { Cursor, CursorMethod } from '../cursor';
import { wrapData, unwrapData } from '../data';
import { CollectionGroup } from '../group';
import { DocId } from '../docId';
import { documentId } from 'firebase/firestore';
import { getDocMeta } from '../utils';

// TODO: Refactor with onQuery

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery;

/**
 * Queries passed collection using query objects ({@link order}, {@link where}, {@link limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ]).then(bornAfter2000 => {
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
 * @returns The promise to the query results
 */
export async function query<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
): Promise<Doc<Model>[]> {
  const { firestoreQueries, cursors } = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method } = q;

          acc.firestoreQueries.push(
            orderBy(
              field instanceof DocId
                ? documentId()
                : field.toString(),
              method,
            ),
          );

          if (q.cursors) {
            const c = q.cursors.reduce((accum, { method, value }) => {
              const val =
                typeof value === 'object' &&
                value !== null &&
                '__type__' in value &&
                value.__type__ == 'doc'
                  ? field instanceof DocId
                    ? value.ref.id
                    : value.data[field]
                  : value;

              // TODO: This can be done better - done to get working, not sure need cursors?
              if (val) {
                switch (method) {
                  case 'startAfter':
                    accum.push(startAfter(val));
                    break;
                  case 'startAt':
                    accum.push(startAt(val));
                    break;
                  case 'endBefore':
                    accum.push(endBefore(val));
                    break;
                  case 'endAt':
                    accum.push(endAt(val));
                    break;
                }
              }

              return accum;
            }, [] as QueryConstraint[]);

            acc.cursors.push(...c);
          }
          break;
        }

        case 'where': {
          const { field, filter, value } = q;
          const fieldName = Array.isArray(field)
            ? field.join('.')
            : field;

          acc.firestoreQueries.push(
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
          acc.firestoreQueries.push(limit(number));
          break;
        }
      }

      return acc;
    },
    {
      firestoreQueries: [] as QueryConstraint[],
      cursors: [] as QueryConstraint[],
    },
  );

  const q = fQuery.apply(null, [
    collectionToFirestoreCollection(collection),
    ...firestoreQueries,
    ...cursors,
  ]);

  const firebaseSnap = await getDocs(q);

  return firebaseSnap.docs.map((snap) =>
    doc(
      collection.__type__ === 'collectionGroup'
        ? pathToRef(snap.ref.path)
        : ref(collection, snap.id),
      wrapData(snap.data()) as Model,
      getDocMeta(snap as any),
    ),
  );
}
