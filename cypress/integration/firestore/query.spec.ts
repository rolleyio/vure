import '../../setup';

import { nanoid } from 'nanoid';

import add from '../../../src/firestore/add';
import { where } from '../../../src/firestore/where';
import { limit } from '../../../src/firestore/limit';
import { query } from '../../../src/firestore/query';
import { collection } from '../../../src/firestore/collection';
import { order } from '../../../src/firestore/order';
import {
  startAfter,
  startAt,
  endBefore,
  endAt,
} from '../../../src/firestore/cursor';
import { Ref, ref } from '../../../src/firestore/ref';
import get from '../../../src/firestore/get';
import set from '../../../src/firestore/set';
import { subcollection } from '../../../src/firestore/subcollection';
import { group } from '../../../src/firestore/group';
import { docId } from '../../../src/firestore/docId';

describe('query', () => {
  type Contact = {
    ownerId: string;
    name: string;
    year: number;
    birthday: Date;
  };
  type Message = {
    ownerId: string;
    author: Ref<Contact>;
    text: string;
  };

  const contacts = collection<Contact>('contacts');
  const messages = collection<Message>('messages');

  const ownerId = nanoid();
  const leshaId = `lesha-${ownerId}`;
  const sashaId = `sasha-${ownerId}`;
  const tatiId = `tati-${ownerId}`;

  before(() =>
    Promise.all([
      set(contacts, leshaId, {
        ownerId,
        name: 'Lesha',
        year: 1995,
        birthday: new Date(1995, 6, 2),
      }),
      set(contacts, sashaId, {
        ownerId,
        name: 'Sasha',
        year: 1987,
        birthday: new Date(1987, 1, 11),
      }),
      set(contacts, tatiId, {
        ownerId,
        name: 'Tati',
        year: 1989,
        birthday: new Date(1989, 6, 10),
      }),
      add(messages, {
        ownerId,
        author: ref(contacts, sashaId),
        text: '+1',
      }),
      add(messages, {
        ownerId,
        author: ref(contacts, leshaId),
        text: '+1',
      }),
      add(messages, {
        ownerId,
        author: ref(contacts, tatiId),
        text: 'wut',
      }),
      add(messages, {
        ownerId,
        author: ref(contacts, sashaId),
        text: 'lul',
      }),
    ]),
  );

  it('queries documents', async () => {
    const docs = await query(contacts, [
      where('ownerId', '==', ownerId),
    ]);
    expect(docs.map(({ data: { name } }) => name).sort()).to.eql([
      'Lesha',
      'Sasha',
      'Tati',
    ]);
  });

  it('allows to query by value in maps', async () => {
    type Location = {
      mapId: string;
      name: string;
      address: { city: string };
    };
    const locations = collection<Location>('locations');
    const mapId = nanoid();
    await add(locations, {
      mapId,
      name: 'Pizza City',
      address: { city: 'New York' },
    });
    await add(locations, {
      mapId,
      name: 'Bagels Tower',
      address: { city: 'New York' },
    });
    await add(locations, {
      mapId,
      name: 'Tacos Cave',
      address: { city: 'Houston' },
    });
    const docs = await query(locations, [
      where('mapId', '==', mapId),
      where(['address', 'city'], '==', 'New York'),
    ]);
    expect(docs.map(({ data: { name } }) => name).sort()).to.eql([
      'Bagels Tower',
      'Pizza City',
    ]);
  });

  it('allows to query using array-contains filter', async () => {
    type Tag = 'pets' | 'cats' | 'dogs' | 'food' | 'hotdogs';
    type Post = { blogId: string; title: string; tags: Tag[] };
    const posts = collection<Post>('posts');
    const blogId = nanoid();
    await Promise.all([
      add(posts, {
        blogId,
        title: 'Post about cats',
        tags: ['pets', 'cats'],
      }),
      add(posts, {
        blogId,
        title: 'Post about dogs',
        tags: ['pets', 'dogs'],
      }),
      add(posts, {
        blogId,
        title: 'Post about hotdogs',
        tags: ['food', 'hotdogs'],
      }),
    ]);
    const docs = await query(posts, [
      where('blogId', '==', blogId),
      where('tags', 'array-contains', 'pets'),
    ]);
    expect(docs.map(({ data: { title } }) => title).sort()).to.eql([
      'Post about cats',
      'Post about dogs',
    ]);
  });

  it('allows to query using in filter', async () => {
    type Pet = {
      ownerId: string;
      name: string;
      type: 'dog' | 'cat' | 'parrot' | 'snake';
    };
    const pets = collection<Pet>('pets');
    const ownerId = nanoid();
    await Promise.all([
      add(pets, {
        ownerId,
        name: 'Persik',
        type: 'dog',
      }),
      add(pets, {
        ownerId,
        name: 'Kimchi',
        type: 'cat',
      }),
      add(pets, {
        ownerId,
        name: 'Snako',
        type: 'snake',
      }),
    ]);
    const docs = await query(pets, [
      where('ownerId', '==', ownerId),
      where('type', 'in', ['cat', 'dog']),
    ]);
    expect(docs.map(({ data: { name } }) => name).sort()).to.eql([
      'Kimchi',
      'Persik',
    ]);
  });

  it('allows to query using array-contains-any filter', async () => {
    type Tag =
      | 'pets'
      | 'cats'
      | 'dogs'
      | 'wildlife'
      | 'food'
      | 'hotdogs';
    type Post = {
      blogId: string;
      title: string;
      tags: Tag[];
    };
    const posts = collection<Post>('posts');
    const blogId = nanoid();
    await Promise.all([
      add(posts, {
        blogId,
        title: 'Post about cats',
        tags: ['pets', 'cats'],
      }),
      add(posts, {
        blogId,
        title: 'Post about dogs',
        tags: ['pets', 'dogs'],
      }),
      add(posts, {
        blogId,
        title: 'Post about hotdogs',
        tags: ['food', 'hotdogs'],
      }),
      add(posts, {
        blogId,
        title: 'Post about kangaroos',
        tags: ['wildlife'],
      }),
    ]);
    const docs = await query(posts, [
      where('blogId', '==', blogId),
      where('tags', 'array-contains-any', ['pets', 'wildlife']),
    ]);
    expect(docs.map(({ data: { title } }) => title).sort()).to.eql([
      'Post about cats',
      'Post about dogs',
      'Post about kangaroos',
    ]);
  });

  it('expands references', async () => {
    const docs = await query(messages, [
      where('ownerId', '==', ownerId),
      where('text', '==', '+1'),
    ]);
    expect(docs[0].data.author.__type__).to.eql('ref');
    const authors = await Promise.all(
      docs.map((doc) => get(contacts, doc.data.author.id)),
    );
    expect(authors.map((author) => author!.data.name).sort()).to.eql([
      'Lesha',
      'Sasha',
    ]);
  });

  it('allows to query by reference', async () => {
    const docs = await query(messages, [
      where('ownerId', '==', ownerId),
      where('author', '==', ref(contacts, sashaId)),
    ]);
    expect(docs.map((doc) => doc.data.text).sort()).to.eql([
      '+1',
      'lul',
    ]);
  });

  it('allows to query by date', async () => {
    const docs = await query(contacts, [
      where('ownerId', '==', ownerId),
      where('birthday', '==', new Date(1987, 1, 11)),
    ]);
    expect(docs.length).to.eql(1);
    expect(docs[0].data.name).to.eql('Sasha');
  });

  it('allows querying collection groups', async () => {
    const ownerId = nanoid();
    const contactMessages = subcollection<Message, Contact>(
      'contactMessages',
      contacts,
    );
    const sashaRef = ref(contacts, `${ownerId}-sasha`);
    const sashasContactMessages = contactMessages(sashaRef);
    add(sashasContactMessages, {
      ownerId,
      author: sashaRef,
      text: 'Hello from Sasha!',
    });
    const tatiRef = ref(contacts, `${ownerId}-tati`);
    const tatisContactMessages = contactMessages(tatiRef);
    await Promise.all([
      add(tatisContactMessages, {
        ownerId,
        author: tatiRef,
        text: 'Hello from Tati!',
      }),
      add(tatisContactMessages, {
        ownerId,
        author: tatiRef,
        text: 'Hello, again!',
      }),
    ]);
    const allContactMessages = group('contactMessages', [
      contactMessages,
    ]);
    const messages = await query(allContactMessages, [
      where('ownerId', '==', ownerId),
    ]);
    expect(messages.map((m) => m.data.text).sort()).to.eql([
      'Hello from Sasha!',
      'Hello from Tati!',
      'Hello, again!',
    ]);
  });

  it('allows querying nested subcollection groups', async () => {
    const contactMessages = subcollection<Message, Contact>(
      'contactMessages',
      contacts,
    );
    type Post = {
      ownerId: string;
      title: string;
    };
    const nestedPost = subcollection<Post, Message, Contact>(
      'posts',
      contactMessages,
    );

    const ownerId = nanoid();
    const messageId = nanoid();
    const nestedPostRef = nestedPost([messageId, ownerId]);
    await add(nestedPostRef, {
      ownerId,
      title: 'Hello',
    });
    await add(nestedPostRef, {
      ownerId,
      title: 'Hello, again!',
    });
    const allPosts = group('posts', [nestedPost]);
    const posts = await query(allPosts, [
      where('ownerId', '==', ownerId),
    ]);
    expect(posts.map((m) => m.data.title).sort()).to.eql([
      'Hello',
      'Hello, again!',
    ]);
  });

  describe('ordering', () => {
    it('allows ordering', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc'),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Sasha',
        'Tati',
        'Lesha',
      ]);
    });

    it('allows ordering by desc', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'desc'),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Lesha',
        'Tati',
        'Sasha',
      ]);
    });

    it('allows ordering by references', async () => {
      const docs = await query(messages, [
        where('ownerId', '==', ownerId),
        order('author', 'desc'),
        order('text'),
      ]);
      const messagesLog = await Promise.all(
        docs.map((doc) =>
          get(contacts, doc.data.author.id).then(
            (contact) => `${contact!.data.name}: ${doc.data.text}`,
          ),
        ),
      );
      expect(messagesLog).to.eql([
        'Tati: wut',
        'Sasha: +1',
        'Sasha: lul',
        'Lesha: +1',
      ]);
    });

    it('allows ordering by date', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('birthday', 'asc'),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Sasha',
        'Tati',
        'Lesha',
      ]);
    });
  });

  describe('limiting', () => {
    it('allows to limit response length', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc'),
        limit(2),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Sasha',
        'Tati',
      ]);
    });
  });

  describe('paginating', () => {
    describe('startAfter', () => {
      it('allows to paginate', async () => {
        const page1Docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(undefined)]),
          limit(2),
        ]);
        expect(page1Docs.map(({ data: { name } }) => name)).to.eql([
          'Sasha',
          'Tati',
        ]);
        const page2Docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(page1Docs[1].data.year)]),
          limit(2),
        ]);
        expect(page2Docs.map(({ data: { name } }) => name)).to.eql([
          'Lesha',
        ]);
      });
    });

    describe('startAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(1989)]),
          limit(2),
        ]);
        expect(docs.map(({ data: { name } }) => name)).to.eql([
          'Tati',
          'Lesha',
        ]);
      });
    });

    describe('endBefore', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [endBefore(1989)]),
          limit(2),
        ]);
        expect(docs.map(({ data: { name } }) => name)).to.eql([
          'Sasha',
        ]);
      });
    });

    describe('endAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [endAt(1989)]),
          limit(2),
        ]);
        expect(docs.map(({ data: { name } }) => name)).to.eql([
          'Sasha',
          'Tati',
        ]);
      });
    });

    it('uses asc ordering method by default', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', [startAt(1989)]),
        limit(2),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Tati',
        'Lesha',
      ]);
    });

    it('allows specify multiple cursor conditions', async () => {
      type City = { mapId: string; name: string; state: string };
      const cities = collection<City>('cities');
      const mapId = nanoid();
      await Promise.all([
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Massachusetts',
        }),
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Missouri',
        }),
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Wisconsin',
        }),
      ]);
      const docs = await query(cities, [
        where('mapId', '==', mapId),
        order('name', 'asc', [startAt('Springfield')]),
        order('state', 'asc', [startAt('Missouri')]),
        limit(2),
      ]);
      expect(
        docs.map(({ data: { name, state } }) => `${name}, ${state}`),
      ).to.eql(['Springfield, Missouri', 'Springfield, Wisconsin']);
    });

    it('allows to combine cursors', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc', [startAt(1989), endAt(1989)]),
        limit(2),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql(['Tati']);
    });

    it('allows to pass docs as cursors', async () => {
      const tati = await get(contacts, tatiId);
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc', [startAt(tati!)]),
        limit(2),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Tati',
        'Lesha',
      ]);
    });

    it('allows using dates as cursors', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
        limit(2),
      ]);
      expect(docs.map(({ data: { name } }) => name)).to.eql([
        'Tati',
        'Lesha',
      ]);
    });
  });

  describe('docId', () => {
    type Counter = { n: number };
    const shardedCounters = collection<Counter>('shardedCounters');

    it('allows to query by documentId', async () => {
      await Promise.all([
        set(shardedCounters, `draft-0`, { n: 0 }),
        set(shardedCounters, `draft-1`, { n: 0 }),
        set(shardedCounters, `published-0`, { n: 0 }),
        set(shardedCounters, `published-1`, { n: 0 }),
        set(shardedCounters, `suspended-0`, { n: 0 }),
        set(shardedCounters, `suspended-1`, { n: 0 }),
      ]);
      const docs = await query(shardedCounters, [
        where(docId, '>=', 'published'),
        where(docId, '<', 'publishee'),
      ]);
      expect(docs.map((doc) => doc.ref.id)).to.eql([
        'published-0',
        'published-1',
      ]);
    });

    it('allows ordering by documentId', async () => {
      const descend = await query(shardedCounters, [
        where(docId, '>=', 'published'),
        where(docId, '<', 'publishee'),
        order(docId, 'desc'),
      ]);
      expect(descend.length).to.eql(2);
      expect(descend[0].ref.id).to.eql(`published-1`);
      expect(descend[1].ref.id).to.eql(`published-0`);

      const ascend = await query(shardedCounters, [
        where(docId, '>=', 'published'),
        where(docId, '<', 'publishee'),
        order(docId, 'asc'),
      ]);
      expect(ascend.length).to.eql(2);
      expect(ascend[0].ref.id).to.eql(`published-0`);
      expect(ascend[1].ref.id).to.eql(`published-1`);
    });

    it('allows cursors to use documentId', async () => {
      const docs = await query(shardedCounters, [
        order(docId, 'asc', [
          startAt('draft-1'),
          endAt('published-1'),
        ]),
      ]);
      expect(docs.length).to.eql(3);
      expect(docs[0].ref.id).to.eql(`draft-1`);
      expect(docs[1].ref.id).to.eql(`published-0`);
      expect(docs[2].ref.id).to.eql(`published-1`);
    });
  });
});
