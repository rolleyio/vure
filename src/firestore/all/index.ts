import { getDocs } from 'firebase/firestore';

import {
  Collection,
  collectionToFirestoreCollection,
} from '../collection';
import { getDocMeta } from '../utils';
import { wrapData } from '../data';
import { doc, Doc } from '../doc';
import { CollectionGroup } from '../group';
import { pathToRef, ref } from '../ref';

/**
 * Returns all documents in a collection.
 *
 * ```ts
 * import { all, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * all(users).then(allUsers => {
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
 * @returns A promise to all documents
 */
export default async function all<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
): Promise<Doc<Model>[]> {
  const firebaseSnap = await getDocs(
    collectionToFirestoreCollection(collection),
  );

  return firebaseSnap.docs.map((snap) => {
    return doc(
      collection.__type__ === 'collectionGroup'
        ? pathToRef(snap.ref.path)
        : ref(collection, snap.id),
      wrapData(snap.data()) as Model,
      getDocMeta(snap),
    );
  });
}
