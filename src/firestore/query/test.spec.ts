import { nanoid } from 'nanoid';
import { useFirestore } from '../composables';
import add from '../add';
import { where } from '../where';
import { limit } from '../limit';
import { query } from '.';
import { collection } from '../collection';
import { order } from '../order';
import { startAfter, startAt, endBefore, endAt } from '../cursor';
import { Ref, ref } from '../ref';
import get from '../get';
import set from '../set';
import { subcollection } from '../subcollection';
import { group } from '../group';
import { docId } from '../docId';

console.log('test');
console.log(useFirestore());

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

  // beforeAll(() =>
  //   Promise.all([
  //     set(contacts, leshaId, {
  //       ownerId,
  //       name: 'Lesha',
  //       year: 1995,
  //       birthday: new Date(1995, 6, 2),
  //     }),
  //     set(contacts, sashaId, {
  //       ownerId,
  //       name: 'Sasha',
  //       year: 1987,
  //       birthday: new Date(1987, 1, 11),
  //     }),
  //     set(contacts, tatiId, {
  //       ownerId,
  //       name: 'Tati',
  //       year: 1989,
  //       birthday: new Date(1989, 6, 10),
  //     }),
  //     add(messages, {
  //       ownerId,
  //       author: ref(contacts, sashaId),
  //       text: '+1',
  //     }),
  //     add(messages, {
  //       ownerId,
  //       author: ref(contacts, leshaId),
  //       text: '+1',
  //     }),
  //     add(messages, {
  //       ownerId,
  //       author: ref(contacts, tatiId),
  //       text: 'wut',
  //     }),
  //     add(messages, {
  //       ownerId,
  //       author: ref(contacts, sashaId),
  //       text: 'lul',
  //     }),
  //   ]),
  // );

  it('queries documents', async () => {
    const docs = await query(contacts, [
      where('ownerId', '==', ownerId),
    ]);
    expect(
      docs.map(({ data: { name } }) => name).sort(),
    ).toStrictEqual(['Lesha', 'Sasha', 'Tati']);
  });
});
