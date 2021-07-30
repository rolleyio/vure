import { nanoid } from 'nanoid';
import get from '../get';
import set from '.';
import { collection } from '../collection';
import { Ref, ref } from '../ref';
import { value } from '../value';

import { initializeFirebaseApp, initializeFirestore } from '../../';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('set', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  it('sets a document', async () => {
    const id = nanoid();
    await set(users, id, { name: 'Sasha' });
    const user = await get(users, id);
    expect(user.data).toStrictEqual({ name: 'Sasha' });
  });

  it('overwrites a document', async () => {
    const id = nanoid();
    await set(users, id, { name: 'Sasha' });
    await set(users, id, { name: 'Sasha Koss' });
    const user = await get(users, id);
    expect(user.data).toStrictEqual({ name: 'Sasha Koss' });
  });

  it('allows setting to refs', async () => {
    const id = nanoid();
    const userRef = ref(users, id);
    await set(userRef, { name: 'Sasha' });
    const user = await get(users, id);
    expect(user.data).toStrictEqual({ name: 'Sasha' });
  });

  it('supports references', async () => {
    const userId = nanoid();
    const postId = nanoid();
    await set(users, userId, { name: 'Sasha' });
    await set(posts, postId, {
      author: ref(users, userId),
      text: 'Hello!',
    });
    const postFromDB = await get(posts, postId);
    const userFromDB = await get(users, postFromDB.data.author.id);
    expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
  });

  it('supports dates', async () => {
    const date = new Date();
    const userRef = ref(users, '42');
    const postId = nanoid();
    await set(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date,
    });
    const postFromDB = await get(posts, postId);
    expect(postFromDB.data.date.getTime()).toBe(date.getTime());
  });

  it('supports server dates', async () => {
    const userRef = ref(users, '42');
    const postId = nanoid();
    await set(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate'),
    });
    const post = await get(posts, postId);
    const now = Date.now();
    const returnedDate = post.data.date;
    expect(returnedDate).toBeInstanceOf(Date);
    expect(
      returnedDate.getTime() < now &&
        returnedDate.getTime() > now - 10000,
    ).toBeTruthy();
    const postFromDB = await get(posts, post.ref.id);
    const dateFromDB = postFromDB.data.date;
    expect(dateFromDB).toBeInstanceOf(Date);
    expect(
      dateFromDB.getTime() < now &&
        dateFromDB.getTime() > now - 10000,
    ).toBeTruthy();
  });
});
