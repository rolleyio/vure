/// <reference types="cypress" />
import '../__test__/setup';

import { nanoid } from 'nanoid';

import { doc } from '../doc';
import { collection } from '../collection';
import { ref } from '../ref';

describe('Doc', () => {
  const users = collection<User>('users');

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid());
      expect(doc(userRef, { name: 'Sasha' })).to.deep.equal({
        __type__: 'doc',
        ref: userRef,
        data: { name: 'Sasha' },
      });
    });
  });
});

interface User {
  name: string;
}
