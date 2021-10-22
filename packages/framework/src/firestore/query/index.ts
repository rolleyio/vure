import {
  limit,
  where,
  orderBy,
  query as firestoreQuery,
  getDocs,
  QueryConstraint,
  startAfter,
  startAt,
  endBefore,
  endAt,
  documentId,
} from 'firebase/firestore';

import { Collection, collectionToFirestoreCollection } from '../collection';
import { doc, Doc } from '../doc';
import { ref, pathToRef } from '../ref';
import { WhereQuery } from '../where';
import { OrderQuery } from '../order';
import { LimitQuery } from '../limit';
import { CursorMethod } from '../cursor';
import { wrapData, unwrapData } from '../data';
import { CollectionGroup } from '../group';
import { DocId } from '../docId';
import { getDocMeta } from '../utils';

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> = OrderQuery<Model, Key> | WhereQuery<Model> | LimitQuery;

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
  const query = processQueries<Model>(collection, queries);
  const firebaseSnap = await getDocs(query);

  return firebaseSnap.docs.map((snap) =>
    doc(
      collection.__type__ === 'collectionGroup' ? pathToRef(snap.ref.path) : ref(collection, snap.id),
      wrapData(snap.data()) as Model,
      getDocMeta(snap as any),
    ),
  );
}

// TODO: test
export function processQueries<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
) {
  const { firestoreQueries, cursors } = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method } = q;

          acc.firestoreQueries.push(
            orderBy(field instanceof DocId ? documentId() : field.toString(), method),
          );

          if (q.cursors) {
            q.cursors.forEach(({ method, value }) => {
              const val =
                typeof value === 'object' && value !== null && '__type__' in value && value.__type__ == 'doc'
                  ? field instanceof DocId
                    ? value.ref.id
                    : value.data[field]
                  : value;

              if (val) {
                if (!acc.cursors[method]) {
                  acc.cursors[method] = [];
                }

                acc.cursors[method].push(val);
              }
            });
          }
          break;
        }

        case 'where': {
          const { field, filter, value } = q;
          const fieldName = Array.isArray(field) ? field.join('.') : field;

          acc.firestoreQueries.push(
            where(fieldName instanceof DocId ? documentId() : fieldName, filter, unwrapData(value)),
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
      cursors: {} as Record<CursorMethod, (string | Model[keyof Model] | Doc<Model>)[]>,
    },
  );

  const firestoreCursors = Object.keys(cursors).reduce((acc, k) => {
    const key = k as unknown as CursorMethod;
    const values = cursors[key];

    if (values.length > 0) {
      switch (key) {
        case 'startAfter':
          acc.push(startAfter(...values));
          break;
        case 'startAt':
          acc.push(startAt(...values));
          break;
        case 'endBefore':
          acc.push(endBefore(...values));
          break;
        case 'endAt':
          acc.push(endAt(...values));
          break;
      }
    }

    return acc;
  }, [] as QueryConstraint[]);

  return firestoreQuery(
    collectionToFirestoreCollection(collection),
    ...firestoreQueries,
    ...firestoreCursors,
  );
}
