import { onSnapshot } from 'firebase/firestore';

import {
  Collection,
  collectionToFirestoreCollection,
} from '../collection';
import { wrapData } from '../data';
import { doc, Doc } from '../doc';
import { CollectionGroup } from '../group';
import { pathToRef, ref } from '../ref';
import { SnapshotInfo } from '../snapshot';

/**
 * Subscribes to all documents in a collection.
 *
 * ```ts
 * import { onAll, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onAll(users, allUsers => {
 *   console.log(allUsers.length)
 *   //=> 420
 *   console.log(allUsers[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(allUsers[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection to get all documents from
 * @param onResult - The function which is called with all documents array when
 * the initial fetch is resolved or the collection updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onAll<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  onResult: (docs: Doc<Model>[], info: SnapshotInfo<Model>) => any,
  onError?: (error: Error) => any,
): () => void {
  let firebaseUnsub: () => void;
  const unsub = () => {
    firebaseUnsub && firebaseUnsub();
  };

  firebaseUnsub = onSnapshot(
    collectionToFirestoreCollection(collection),
    (firestoreSnap) => {
      const docs = firestoreSnap.docs.map((snap) =>
        doc<Model>(
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
