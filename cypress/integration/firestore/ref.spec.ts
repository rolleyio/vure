import '../../setup';

import {
  getRefPath,
  ref,
  pathToRef,
  id,
} from '../../../src/firestore/ref';
import { collection } from '../../../src/firestore/collection';

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

  describe('id', () => {
    it('generates random id', async () => {
      const userId = id();
      expect(typeof userId).to.equal('string');
      expect(userId.length > 10).to.be.true;
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
