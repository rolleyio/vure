import { geohashQueryBounds, distanceBetween } from 'geofire-common';

import { Collection } from '../collection';
import { Doc } from '../doc';
import { query } from '../query';
import { order } from '../order';
import { endAt, startAt } from '../cursor';
import { limit } from '../limit';

export type Location = {
  geohash: string;
  lat: number;
  lng: number;
};

export type LocationModel = {
  location: Location;
};

// TODO: test this

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
async function getInRadius<Model extends LocationModel>(
  collection: Collection<Model>,
  center: [number, number],
  radiusInM: number,
  maxLimit = 5,
): Promise<Doc<Model>[]> {
  // https://firebase.google.com/docs/firestore/solutions/geoqueries
  // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
  // a separate query for each pair. There can be up to 9 pairs of bounds
  // depending on overlap, but in most cases there are 4.
  const bounds = geohashQueryBounds(center, radiusInM);
  const promises: Promise<Doc<Model>[]>[] = [];

  for (const b of bounds) {
    const q = query(collection, [
      order(['location', 'geohash'], 'asc', [
        startAt(b[0]),
        endAt(b[1]),
      ]),
      limit(maxLimit),
    ]);

    promises.push(q);
  }

  // Collect all the query results together into a single list
  return Promise.all(promises).then((snapshots) => {
    const matchingDocs: Doc<Model>[] = [];

    for (const snap of snapshots) {
      for (const doc of snap) {
        const { lat, lng } = doc.data.location;

        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;

        if (distanceInM <= radiusInM) {
          matchingDocs.push(doc);
        }
      }
    }

    return matchingDocs;
  });
}

export default getInRadius;
