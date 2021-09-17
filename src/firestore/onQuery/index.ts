import { onSnapshot, QuerySnapshot } from 'firebase/firestore';

import { Collection } from '../collection';
import { wrapData } from '../data';
import { doc, Doc } from '../doc';
import { CollectionGroup } from '../group';
import { LimitQuery } from '../limit';
import { OrderQuery } from '../order';
import { pathToRef, ref } from '../ref';
import { WhereQuery } from '../where';
import { SnapshotInfo } from '../snapshot';
import { processQueries } from '../query';

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

  const query = processQueries<Model>(collection, queries);

  firebaseUnsub = onSnapshot(
    query,
    (firestoreSnap: QuerySnapshot) => {
      const docs: Doc<Model>[] = firestoreSnap.docs.map((snap) =>
        doc(
          collection.__type__ === 'collectionGroup'
            ? pathToRef(snap.ref.path)
            : ref(collection, snap.id),
          wrapData(snap.data()) as Model,
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
