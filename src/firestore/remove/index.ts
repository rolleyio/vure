import { doc as firestoreDoc, deleteDoc } from '@firebase/firestore';

import {
  Collection,
  collectionToFirestoreCollection,
} from '../collection';
import { Ref } from '../ref';

/**
 * @param collection - The collection to remove document in
 * @param id - The id of the documented to remove
 */
async function remove<Model>(
  collection: Collection<Model>,
  id: string,
): Promise<void>;

/**
 * @param ref - The reference to the document to remove
 */
async function remove<Model>(ref: Ref<Model>): Promise<void>;

/**
 * Removes a document.
 *
 * ```ts
 * import { remove } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * remove(users, '00sHm46UWKObv2W7XK9e').then(() => console.log('Done!'))
 * ```
 *
 * @returns A promise that resolves when the operation is complete
 */
async function remove<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeId?: string,
): Promise<void> {
  let collection: Collection<Model>;
  let id: string;

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>;
    id = maybeId as string;
  } else {
    const ref = collectionOrRef as Ref<Model>;
    collection = ref.collection;
    id = ref.id;
  }

  await deleteDoc(
    firestoreDoc(
      collectionToFirestoreCollection(collection.path),
      id,
    ),
  );
}

export default remove;
