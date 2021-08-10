import { collection as firebaseCollection } from 'firebase/firestore';

import { useFirestore } from '../composables';

/**
 * The collection type. It contains the path in Firestore.
 */
export interface Collection<_Model> {
  __type__: 'collection';
  path: string;
}

/**
 * Creates a collection object.
 *
 * ```ts
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 * //=> { __type__: 'collection', path: 'users' }
 *
 * add(users, { name: 'Sasha' })
 * ```
 *
 * @param path - The collection path
 * @returns The collection object
 */
export function collection<Model>(path: string): Collection<Model> {
  return {
    __type__: 'collection',
    path,
  };
}

export function collectionToFirestoreCollection(path: string) {
  return firebaseCollection(useFirestore(), path);
}
