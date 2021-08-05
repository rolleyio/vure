import '../__test__/setup';

import { collection } from '../collection';

describe('collection', () => {
  type User = { name: string };

  it('creates collection object', () => {
    expect(collection<User>('users')).to.deep.equal({
      __type__: 'collection',
      path: 'users',
    });
  });
});
