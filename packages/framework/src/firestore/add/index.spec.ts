/// <reference types="cypress" />
import '../__test__/setup';

import add from '../add';

import { collection } from '../collection';
import get from '../get';
import { Ref, ref } from '../ref';
import { value } from '../value';

describe('add', () => {
  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };

  const users = collection<User>('users');
  const posts = collection<Post>('post');

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' };
    const user = await add(users, data);
    const { id } = user;
    expect(typeof id).to.eq('string');
    const userFromDB = await get(users, id);
    return expect(userFromDB?.data).to.deep.equal(data);
  });

  it('supports references', async () => {
    const user = await add(users, { name: 'Sasha' });
    const post = await add(posts, {
      author: user,
      text: 'Hello!',
    });
    const postFromDB = await get(posts, post.id);
    const userFromDB = await get(users, postFromDB!.data.author.id);
    return expect(userFromDB?.data).to.deep.equal({ name: 'Sasha' });
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
    expect(postFromDB?.data.date).to.be.instanceOf(Date);
    return expect(postFromDB!.data.date!.getTime()).to.equal(date.getTime());
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
    const returnedDate = post?.data.date;
    expect(returnedDate).to.be.instanceOf(Date);
    expect(returnedDate!.getTime() < now && returnedDate!.getTime() > now - 10000).to.be.true;
    const postFromDB = await get(posts, post!.ref.id);
    const dateFromDB = postFromDB!.data.date;
    expect(dateFromDB).to.be.instanceOf(Date);
    return expect(dateFromDB!.getTime() < now && dateFromDB!.getTime() > now - 10000).to.be.true;
  });
});
