import { CollectionReference } from 'firebase/firestore';
import { CollectionGroup } from '../group';
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
export declare function collection<Model>(path: string): Collection<Model>;
export declare function collectionToFirestoreCollection(collection: Collection<any> | CollectionGroup<any>): CollectionReference<import("firebase/firestore").DocumentData>;
