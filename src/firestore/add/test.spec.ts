import { clearFirestoreData } from '@firebase/rules-unit-testing';
import add from '.';
import { initializeFirebaseApp, initializeFirestore } from '../../';
import { collection } from '../collection';
import get from '../get';
import { Ref, ref } from '../ref';
import { value } from '../value';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('add', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' };
    const user = await add(users, data);
    const { id } = user;
    expect(typeof id).toBe('string');
    const userFromDB = await get(users, id);
    return expect(userFromDB.data).toStrictEqual(data);
  });

  it('supports references', async () => {
    const user = await add(users, { name: 'Sasha' });
    const post = await add(posts, {
      author: user,
      text: 'Hello!',
    });
    const postFromDB = await get(posts, post.id);
    const userFromDB = await get(users, postFromDB.data.author.id);
    return expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
  });

  it('supports dates', async () => {
    const userRef = ref(users, '42');
    const date = new Date();
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date,
    });
    const postFromDB = await get(posts, post.id);
    expect(postFromDB.data.date).toBeInstanceOf(Date);
    return expect(postFromDB.data.date.getTime()).toBe(
      date.getTime(),
    );
  });

  it('supports server dates', async () => {
    const userRef = ref(users, '42');
    const postRef = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate'),
    });
    const post = await get(postRef);
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
    return expect(
      dateFromDB.getTime() < now &&
        dateFromDB.getTime() > now - 10000,
    ).toBeTruthy();
  });
});
