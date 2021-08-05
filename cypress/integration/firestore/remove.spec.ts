import '../../setup';

import get from '../../../src/firestore/get';
import add from '../../../src/firestore/add';
import remove from '../../../src/firestore/remove';
import { collection } from '../../../src/firestore/collection';

describe('remove', () => {
  type User = { name: string };
  const users = collection<User>('users');

  it('removes document', async () => {
    const user = await add(users, { name: 'Sasha' });
    const { id } = user;
    await remove(users, id);
    const userFromDB = await get(users, id);
    expect(userFromDB).to.equal(null);
  });

  it('allows removing by ref', async () => {
    const user = await add(users, { name: 'Sasha' });
    await remove(user);
    const userFromDB = await get(users, user.id);
    expect(userFromDB).to.equal(null);
  });
});
