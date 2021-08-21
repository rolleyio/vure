/// <reference types="cypress" />
import '../__test__/setup';

import { getRefPath, ref, pathToRef } from '../ref';
import { collection } from '../collection';

describe('Ref', () => {
  interface User {
    name: string;
  }
  const users = collection<User>('users');

  describe('ref', () => {
    it('creates ref object', () => {
      expect(ref(users, '42')).to.deep.equal({
        __type__: 'ref',
        id: '42',
        collection: users,
      });
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
      ).to.equal('users/42');
    });
  });

  describe('pathToRef', () => {
    it('returns full document path', () => {
      expect(pathToRef('users/42')).to.deep.equal({
        __type__: 'ref',
        id: '42',
        collection: users,
      });
    });
  });
});
