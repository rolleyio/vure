import { Collection } from '../collection';
import { Doc } from '../doc';
export declare type Location = {
    geohash: string;
    lat: number;
    lng: number;
};
export declare type LocationModel = {
    location: Location;
};
/**
 * Retrieves a document from a collection.
 *
 * ```ts
 * import { getInRadius, collection } from 'typesaurus'
 *
 * type User = { name: string, location: { geohash: string, lat: number, lng: number} }
 * const users = collection<User>('users')
 *
 * getInRadius(users,  [51.5074, 0.1278], 50 * 1000).then(user => {
 *   console.log(user)
 *   //=> { __type__: 'doc', data: { name: 'Sasha' }, ... }
 * })
 * ```
 *
 * @returns Promise to the documents within the radius or empty array
 */
declare function getInRadius<Model extends LocationModel>(collection: Collection<Model>, center: [number, number], radiusInM: number, maxLimit?: number): Promise<Doc<Model>[]>;
export default getInRadius;
