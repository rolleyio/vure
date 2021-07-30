import { initializeFirebaseApp, initializeFirestore } from '../../';
import { collection } from '.';

const firebase = initializeFirebaseApp({
  projectId: 'vure',
});
const firestore = initializeFirestore({ enabled: true });

describe('collection', () => {
  type User = { name: string };

  it('creates collection object', () => {
    expect(collection<User>('users')).toStrictEqual({
      __type__: 'collection',
      path: 'users',
    });
  });
});
