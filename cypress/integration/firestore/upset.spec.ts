import '../../setup';

import { nanoid } from 'nanoid';

import get from '../../../src/firestore/get';
import upset from '../../../src/firestore/upset';
import { collection } from '../../../src/firestore/collection';
import { Ref, ref } from '../../../src/firestore/ref';
import { value } from '../../../src/firestore/value';
import set from '../../../src/firestore/set';
import update from '../../../src/firestore/update';

describe('merge', () => {
  type User = { name: string; deleted?: boolean };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  const defaultUser: User = {
    name: 'Sasha',
  };

  it('creates a document if it does not exist', async () => {
    const id = nanoid();
    const initialUser = await get(users, id);
    expect(initialUser).to.equal(null);
    await upset(users, id, { name: 'Sasha' });
    const user = await get(users, id);
    expect(user!.data).to.deep.equal({ name: 'Sasha' });
  });

  it('merges data if the document does exits', async () => {
    const id = nanoid();
    await set(users, id, defaultUser);
    await update(users, id, { deleted: true });
    await upset(users, id, { name: 'Sasha Koss' });
    const user = await get(users, id);
    expect(user!.data).to.deep.equal({
      name: 'Sasha Koss',
      deleted: true,
    });
  });

  it('allows setting to refs', async () => {
    const id = nanoid();
    const userRef = ref(users, id);
    await upset(userRef, { name: 'Sasha' });
    const user = await get(users, id);
    expect(user!.data).to.deep.equal({ name: 'Sasha' });
  });

  it('supports references', async () => {
    const userId = nanoid();
    const postId = nanoid();
    await upset(users, userId, { name: 'Sasha' });
    await upset(posts, postId, {
      author: ref(users, userId),
      text: 'Hello!',
    });
    const postFromDB = await get(posts, postId);
    const userFromDB = await get(users, postFromDB!.data.author.id);
    expect(userFromDB!.data).to.deep.equal({ name: 'Sasha' });
  });

  it('supports dates', async () => {
    const date = new Date();
    const userRef = ref(users, '42');
    const postId = nanoid();
    await upset(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date,
    });
    const postFromDB = await get(posts, postId);
    expect(postFromDB!.data.date!.getTime()).to.equal(date.getTime());
  });

  it('supports server dates', async () => {
    const userRef = ref(users, '42');
    const postId = nanoid();
    await upset(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate'),
    });
    const now = Date.now();
    const post = await get(posts, postId);
    const returnedDate = post!.data.date!;
    expect(returnedDate instanceof Date);
    expect(
      returnedDate.getTime() < now &&
        returnedDate.getTime() > now - 10000,
    );
    const postFromDB = await get(posts, post!.ref.id);
    const dateFromDB = postFromDB!.data.date!;
    expect(dateFromDB instanceof Date);
    expect(
      dateFromDB.getTime() < now &&
        dateFromDB.getTime() > now - 10000,
    );
  });

  it('allows incrementing values', async () => {
    type Counter = { count: number; flagged?: boolean };
    const counters = collection<Counter>('conters');
    const id = nanoid();
    await upset(counters, id, {
      count: value('increment', 5),
    });
    const counter5 = await get(counters, id);
    expect(counter5!.data.count).to.equal(5);
    await update(counters, id, { flagged: true });
    await upset(counters, id, {
      count: value('increment', 5),
    });
    const counter10 = await get(counters, id);
    expect(counter10!.data.count).to.equal(10);
    expect(counter10!.data.flagged);
  });

  describe('updating arrays', () => {
    type Favorite = { favorites: string[] };
    const favorites = collection<Favorite>('favorites');

    it('union update', async () => {
      const id = nanoid();
      await upset(favorites, id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
        ],
      });
      await upset(favorites, id, {
        favorites: value('arrayUnion', [
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets',
        ]),
      });
      const favFromDB = await get(favorites, id);
      expect(favFromDB!.data).to.deep.equal({
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets',
        ],
      });
    });

    it('remove update', async () => {
      const id = nanoid();
      await upset(favorites, id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
        ],
      });
      await upset(favorites, id, {
        favorites: value('arrayRemove', [
          'The 22 Immutable Laws of Marketing',
          'Sapiens',
        ]),
      });
      const favFromDB = await get(favorites, id);
      expect(favFromDB!.data).to.deep.equal({
        favorites: ['The Mom Test'],
      });
    });
  });
});
