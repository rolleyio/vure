import { getRefPath, ref, pathToRef, id } from '.';
import { collection } from '../collection';

import { initializeFirebaseApp, initializeFirestore } from '../../';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('Ref', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  interface User {
    name: string;
  }
  const users = collection<User>('users');

  describe('ref', () => {
    it('creates ref object', () => {
      expect(ref(users, '42')).toStrictEqual({
        __type__: 'ref',
        id: '42',
        collection: users,
      });
    });
  });

  describe('id', () => {
    it('generates random id', async () => {
      const userId = id();
      expect(typeof userId).toBe('string');
      expect(userId.length > 10).toBeTruthy();
    });
  });

  describe('getRefPath', () => {
    it('returns full document path', () => {
      expect(
        getRefPath({
          __type__: 'ref',
          id: '42',
          collection: users,
        }),
      ).toBe('users/42');
    });
  });

  describe('pathToRef', () => {
    it('returns full document path', () => {
      expect(pathToRef('users/42')).toStrictEqual({
        __type__: 'ref',
        id: '42',
        collection: users,
      });
    });
  });
});
