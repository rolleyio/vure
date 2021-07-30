import onGet from '.';
import get from '../get';
import { collection } from '../collection';
import { Ref, ref } from '../ref';
import add from '../add';
import update from '../update';

import { initializeFirebaseApp, initializeFirestore } from '../../';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('onGet', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  let off: (() => void) | undefined;

  afterEach(() => {
    off && off();
    off = undefined;
  });

  it('returns nothing if document is not present', (done) => {
    off = onGet(collection('nope'), 'nah', (nothing) => {
      expect(nothing === null);
      done();
    });
  });

  it('allows to get by ref', async () => {
    const user = await add(users, { name: 'Sasha' });
    return new Promise((resolve) => {
      off = onGet(user, (userFromDB) => {
        expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
        resolve(true);
      });
    });
  });

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' });
    const post = await add(posts, {
      author: user,
      text: 'Hello!',
    });
    return new Promise((resolve) => {
      off = onGet(posts, post.id, async (postFromDB) => {
        expect(postFromDB.data.author.__type__ === 'ref');
        const userFromDB = await get(
          users,
          postFromDB.data.author.id,
        );
        expect(userFromDB.data).toStrictEqual({ name: 'Sasha' });
        resolve(true);
      });
    });
  });

  it('expands dates', async () => {
    const date = new Date();
    const userRef = ref(users, '42');
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date,
    });
    return new Promise((resolve) => {
      off = onGet(posts, post.id, (postFromDB) => {
        expect(postFromDB.data.date.getTime() === date.getTime());
        resolve(true);
      });
    });
  });

  describe('real-time', () => {
    it('subscribes to updates', async () => {
      const spy = jest.fn();
      const user = await add(users, { name: 'Sasha' });
      return new Promise((resolve) => {
        off = onGet(user, async (doc) => {
          const { name } = doc.data;
          spy(name);
          if (name === 'Sasha') {
            await update(user, { name: 'Sasha Koss' });
          } else if (name === 'Sasha Koss') {
            expect(spy).toBeCalledWith('Sasha');
            expect(spy).toBeCalledWith('Sasha Koss');
            resolve(true);
          }
        });
      });
    });

    // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    if (typeof window === undefined) {
      it('returns function that unsubscribes from the updates', () => {
        return new Promise(async (resolve) => {
          const spy = jest.fn();
          const user = await add(users, { name: 'Sasha' });
          const on = () => {
            off = onGet(user, (doc) => {
              const { name } = doc.data;
              spy(name);
              if (name === 'Sasha Koss') {
                off();
                expect(spy).not.toBeCalledWith('Sashka');
                expect(spy).toBeCalledWith('Sasha Koss');
                resolve(true);
              }
            });
          };
          on();
          off();
          await update(user, { name: 'Sashka' });
          await update(user, { name: 'Sasha Koss' });
          on();
        });
      });
    }
  });
});
