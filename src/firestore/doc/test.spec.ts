import { nanoid } from 'nanoid';
import { doc } from '.';
import { collection } from '../collection';
import { ref } from '../ref';

describe('Doc', () => {
  const users = collection<User>('users');

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid());
      expect(doc(userRef, { name: 'Sasha' })).toStrictEqual({
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
