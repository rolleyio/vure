import { initializeFirebaseApp, initializeFirestore } from '../../';
import get from '.';
import { collection } from '../collection';
import { Ref, ref } from '../ref';
import add from '../add';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('get', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  it('returns nothing if document is not present', async () => {
    const nothing = await get(collection('nope'), 'nah');
    expect(nothing).toBeNull();
  });

  it('allows to get by ref', async () => {
    const user = await add(users, { name: 'Sasha' });
    const userFromDB = await get(user);
    expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
  });

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' });
    const post = await add(posts, {
      author: user,
      text: 'Hello!',
    });
    const postFromDB = await get(posts, post.id);
    expect(postFromDB.data.author.__type__).toBe('ref');
    const userFromDB = await get(users, postFromDB.data.author.id);
    expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
  });

  it('expands dates', async () => {
    const date = new Date();
    const userRef = ref(users, '42');
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date,
    });
    const postFromDB = await get(posts, post.id);
    expect(postFromDB.data.date.getTime()).toBe(date.getTime());
  });
});
