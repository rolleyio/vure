import get from '../get';
import add from '../add';
import remove from '.';
import { collection } from '../collection';

import { initializeFirebaseApp, initializeFirestore } from '../../';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('remove', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  const users = collection<User>('users');

  it('removes document', async () => {
    const user = await add(users, { name: 'Sasha' });
    const { id } = user;
    await remove(users, id);
    const userFromDB = await get(users, id);
    expect(userFromDB).toBe(null);
  });

  it('allows removing by ref', async () => {
    const user = await add(users, { name: 'Sasha' });
    await remove(user);
    const userFromDB = await get(users, user.id);
    expect(userFromDB).toBe(null);
  });
});
