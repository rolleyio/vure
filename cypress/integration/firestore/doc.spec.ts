import '../../setup';

import { nanoid } from 'nanoid';

import { doc } from '../../../src/firestore/doc';
import { collection } from '../../../src/firestore/collection';
import { ref } from '../../../src/firestore/ref';

describe('Doc', () => {
  const users = collection<User>('users');

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid());
      expect(doc(userRef, { name: 'Sasha' })).to.deep.equal({
        __type__: 'doc',
        meta: undefined,
        ref: userRef,
        data: { name: 'Sasha' },
      });
    });
  });
});

interface User {
  name: string;
}
