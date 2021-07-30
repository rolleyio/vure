import { initializeFirebaseApp, initializeFirestore } from '../../';

import onAll from '.';
import set from '../set';
import { collection } from '../collection';
import { Ref, ref } from '../ref';
import get from '../get';
import remove from '../remove';
import { nanoid } from 'nanoid';
import { subcollection } from '../subcollection';
import add from '../add';
import { group } from '../group';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('onAll', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type Book = { title: string };
  type Order = { book: Ref<Book>; quantity: number; date?: Date };

  const books = collection<Book>('books');
  const orders = collection<Order>('orders');

  beforeEach(async () => {
    await Promise.all([
      set(books, 'sapiens', { title: 'Sapiens' }),
      set(books, '22laws', {
        title: 'The 22 Immutable Laws of Marketing',
      }),
      set(books, 'momtest', { title: 'The Mom Test' }),
      remove(books, 'hp1'),
      remove(books, 'hp2'),
    ]);
  });

  let off: (() => void) | undefined;

  afterEach(() => {
    off && off();
    off = undefined;
  });

  it('returns all documents in a collection', () => {
    const spy = jest.fn();
    off = onAll(books, (docs) => {
      spy(docs.map(({ data: { title } }) => title).sort());
      expect(spy).toBeCalledWith([
        [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
        ],
      ]);
    });
  });

  it('expands references', async () => {
    await Promise.all([
      set(orders, 'order1', {
        book: ref(books, 'sapiens'),
        quantity: 1,
      }),
      set(orders, 'order2', {
        book: ref(books, '22laws'),
        quantity: 1,
      }),
    ]);

    return new Promise((resolve) => {
      const spy = jest.fn();
      off = onAll(orders, async (docs) => {
        off();
        const orderedBooks = await Promise.all(
          docs.map((doc) => get(books, doc.data.book.id)),
        );
        spy(orderedBooks.map(({ data: { title } }) => title).sort());
        expect(spy).toBeCalledWith([
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
        ]);
        resolve(true);
      });
    });
  });

  it('expands dates', async () => {
    const date = new Date();
    await Promise.all([
      set(orders, 'order1', {
        book: ref(books, 'sapiens'),
        quantity: 1,
        date,
      }),
      set(orders, 'order2', {
        book: ref(books, '22laws'),
        quantity: 1,
        date,
      }),
    ]);

    return new Promise((resolve) => {
      off = onAll(orders, (docs) => {
        if (
          docs.length === 2 &&
          docs[0].data.date &&
          docs[1].data.date
        ) {
          off();
          if (typeof window === undefined) {
            expect(docs[0].data.date.getTime()).toBe(date.getTime());
            expect(docs[1].data.date.getTime()).toBe(date.getTime());
          } else {
            // TODO: WTF, Node.js and browser dates are processed differently
            expect(
              docs[0].data.date.getTime() - date.getTime() < 20000,
            ).toBeTruthy();
            expect(
              docs[1].data.date.getTime() - date.getTime() < 20000,
            ).toBeTruthy();
          }
          resolve(true);
        }
      });
    });
  });

  it('allows to get all data from collection groups', async () => {
    const commentsGroupName = `comments-${nanoid()}`;
    type Comment = { text: string };

    const bookComments = subcollection<Comment, Book>(
      commentsGroupName,
      books,
    );
    const orderComments = subcollection<Comment, Order>(
      commentsGroupName,
      orders,
    );

    await Promise.all([
      add(bookComments('qwe'), {
        text: 'hello',
      }),

      add(bookComments('asd'), {
        text: 'cruel',
      }),

      add(orderComments('zxc'), {
        text: 'world',
      }),
    ]);

    const allComments = group(commentsGroupName, [
      bookComments,
      orderComments,
    ]);
    return new Promise((resolve) => {
      off = onAll(allComments, (comments) => {
        if (comments.length === 3) {
          off();
          expect(
            comments.map((c) => c.data.text).sort(),
          ).toStrictEqual(['cruel', 'hello', 'world']);
          resolve(true);
        }
      });
    });
  });

  describe('empty', () => {
    it('should notify with values all indicate empty', (done) => {
      off = onAll(collection('void'), (docs, { changes, empty }) => {
        expect(empty).toBeTruthy();
        expect(docs).toHaveLength(0);
        expect(changes()).toHaveLength(0);
        done();
      });
    });
  });

  describe('real-time', () => {
    it('subscribes to updates', (done) => {
      let c = 0;
      off = onAll(books, async (docs, { changes }) => {
        const titles = docs
          .map(({ data: { title } }) => title)
          .sort();
        const docChanges = changes()
          .map(
            ({
              type,
              doc: {
                data: { title },
              },
            }) => ({ type, title }),
          )
          .sort((a, b) => a.title.localeCompare(b.title));

        switch (++c) {
          case 1:
            expect(titles).toEqual([
              'Sapiens',
              'The 22 Immutable Laws of Marketing',
              'The Mom Test',
            ]);
            expect(docChanges).toEqual([
              { type: 'added', title: 'Sapiens' },
              {
                type: 'added',
                title: 'The 22 Immutable Laws of Marketing',
              },
              { type: 'added', title: 'The Mom Test' },
            ]);
            await set(books, 'hp1', {
              title: "Harry Potter and the Sorcerer's Stone",
            });
            return;
          case 2:
            expect(titles).toEqual([
              "Harry Potter and the Sorcerer's Stone",
              'Sapiens',
              'The 22 Immutable Laws of Marketing',
              'The Mom Test',
            ]);
            expect(docChanges).toEqual([
              {
                type: 'added',
                title: "Harry Potter and the Sorcerer's Stone",
              },
            ]);
            done();
        }
      });
    });

    // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    if (typeof window === undefined) {
      it('returns function that unsubscribes from the updates', () => {
        return new Promise(async (resolve) => {
          const spy = jest.fn();
          const on = () => {
            off = onAll(books, (docs) => {
              const titles = docs
                .map(({ data: { title } }) => title)
                .sort();
              spy(titles);
              if (titles.length === 5) {
                off();
                expect(spy).not.toHaveBeenCalledWith([
                  "Harry Potter and the Sorcerer's Stone",
                  'Sapiens',
                  'The 22 Immutable Laws of Marketing',
                  'The Mom Test',
                ]);
                expect(spy).toBeCalledWith([
                  'Harry Potter and the Chamber of Secrets',
                  "Harry Potter and the Sorcerer's Stone",
                  'Sapiens',
                  'The 22 Immutable Laws of Marketing',
                  'The Mom Test',
                ]);
                resolve(true);
              }
            });
          };
          on();
          off();
          await set(books, 'hp1', {
            title: "Harry Potter and the Sorcerer's Stone",
          });
          await set(books, 'hp2', {
            title: 'Harry Potter and the Chamber of Secrets',
          });
          on();
        });
      });
    }
  });
});
