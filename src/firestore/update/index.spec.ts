/// <reference types="cypress" />
import '../__test__/setup';

import { nanoid } from 'nanoid';

import update from '../update';
import add from '../add';
import { collection } from '../collection';
import field from '../field';
import get from '../get';
import { ref, Ref } from '../ref';
import set from '../set';
import { value } from '../value';

describe('update', () => {
  type User = {
    name: string;
    address: { city: string };
    visits: number;
    guest?: boolean;
    birthday?: Date;
  };
  type Post = { author: Ref<User>; text: string };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  it('updates document', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
    const { id } = user;
    await update(users, id, { name: 'Sasha Koss' });
    const userFromDB = await get(users, id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha Koss',
      address: { city: 'Omsk' },
      visits: 0,
    });
  });

  it('allows updating refs', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
    await update(user, { name: 'Sasha Koss' });
    await update(user, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Moscow'),
    ]);
    const userFromDB = await get(users, user.id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha Koss',
      address: { city: 'Moscow' },
      visits: 0,
    });
  });

  it('allows update nested maps', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
    const { id } = user;
    await update(users, id, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Dimitrovgrad'),
      field('visits', value('increment', 1)),
    ]);
    const userFromDB = await get(users, id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha Koss',
      address: { city: 'Dimitrovgrad' },
      visits: 1,
    });
  });

  it('supports references', async () => {
    const userId1 = nanoid();
    const userId2 = nanoid();
    await set(users, userId1, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
    await set(users, userId2, {
      name: 'Tati',
      address: { city: 'Dimitrovgrad' },
      visits: 0,
    });
    const postId = nanoid();
    await set(posts, postId, {
      author: ref(users, userId1),
      text: 'Hello!',
    });
    await update(posts, postId, { author: ref(users, userId2) });
    const postFromDB = await get(posts, postId);
    const userFromDB = await get(users, postFromDB!.data.author.id);
    expect(userFromDB!.data.name).to.equal('Tati');
  });

  it('allows removing values', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
      guest: true,
    });
    const { id } = user;
    await update(users, id, { guest: value('remove') });
    const userFromDB = await get(users, id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
  });

  it('allows incrementing values', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
    });
    const { id } = user;
    await update(users, id, { visits: value('increment', 2) });
    const userFromDB = await get(users, id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 2,
    });
  });

  it('supports dates', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0,
    });
    const { id } = user;
    await update(users, id, { birthday: new Date(1987, 1, 11) });
    const userFromDB = await get(users, id);
    expect(userFromDB!.data).to.deep.equal({
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 1, 11),
      visits: 0,
    });
  });

  it('supports server dates', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0,
    });
    const { id } = user;
    await update(users, id, { birthday: value('serverDate') });
    const userFromDB = await get(users, id);
    const dateFromDB = userFromDB!.data.birthday!;
    const now = Date.now();
    expect(dateFromDB).to.be.instanceOf(Date);
    expect(
      dateFromDB.getTime() < now &&
        dateFromDB.getTime() > now - 10000,
    ).to.be.true;
  });

  describe('updating arrays', () => {
    type Favorite = { userId: string; favorites: string[] };
    const favorites = collection<Favorite>('favorites');

    type Movies = { title: string; likedBy: Ref<User>[] };
    const movies = collection<Movies>('movies');

    it('union update', async () => {
      const userId = nanoid();
      const fav = await add(favorites, {
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
        ],
      });
      const { id } = fav;
      await update(favorites, id, {
        favorites: value('arrayUnion', [
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets',
        ]),
      });
      const favFromDB = await get(favorites, id);
      expect(favFromDB!.data).to.deep.equal({
        userId,
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
      const userId = nanoid();
      const fav = await add(favorites, {
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
        ],
      });
      const { id } = fav;
      await update(favorites, id, {
        favorites: value('arrayRemove', [
          'The 22 Immutable Laws of Marketing',
          'Sapiens',
        ]),
      });
      const favFromDB = await get(favorites, id);
      expect(favFromDB!.data).to.deep.equal({
        userId,
        favorites: ['The Mom Test'],
      });
    });

    it('union update references', async () => {
      const user1 = ref(users, nanoid());
      const user2 = ref(users, nanoid());
      const movie = await add(movies, {
        title: "Harry Potter and the Sorcerer's Stone",
        likedBy: [user1],
      });

      await update(movie, {
        likedBy: value('arrayUnion', [user2]),
      });
      const movieFromDB = await get(movie);
      expect(movieFromDB!.data).to.deep.equal({
        title: "Harry Potter and the Sorcerer's Stone",
        likedBy: [user1, user2],
      });
    });

    it('remove update references', async () => {
      const user1 = ref(users, nanoid());
      const user2 = ref(users, nanoid());
      const movie = await add(movies, {
        title: 'Harry Potter and the Chamber of Secrets',
        likedBy: [user1, user2],
      });

      await update(movie, {
        likedBy: value('arrayRemove', [user2]),
      });
      const bookFromDB = await get(movie);
      expect(bookFromDB!.data).to.deep.equal({
        title: 'Harry Potter and the Chamber of Secrets',
        likedBy: [user1],
      });
    });
  });
});
