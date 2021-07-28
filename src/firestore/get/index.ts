import { doc as firestoreDoc, getDoc } from '@firebase/firestore';

import { Collection } from '../collection';
import { getDocMeta } from '../utils';
import { wrapData } from '../data';
import { doc, Doc } from '../doc';
import { ref, Ref } from '../ref';

/**
 * @param ref - The reference to the document
 */
async function get<Model>(
  ref: Ref<Model>,
): Promise<Doc<Model> | null>;

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
async function get<Model>(
  collection: Collection<Model>,
  id: string,
): Promise<Doc<Model> | null>;

/**
 * Retrieves a document from a collection.
 *
 * ```ts
 * import { get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * get(users, '00sHm46UWKObv2W7XK9e').then(user => {
 *   console.log(user)
 *   //=> { __type__: 'doc', data: { name: 'Sasha' }, ... }
 * })
 * // Or using ref:
 * get(currentUser.ref)
 * ```
 *
 * @returns Promise to the document or null if not found
 */
async function get<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeId?: string,
): Promise<Doc<Model> | null> {
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

  const firestoreSnap = await getDoc(
    firestoreDoc(collection.path, id),
  );
  const firestoreData = firestoreSnap.data();
  const data = firestoreData && (wrapData(firestoreData) as Model);
  return data
    ? doc(ref(collection, id), data, getDocMeta(firestoreSnap))
    : null;
}

export default get;
