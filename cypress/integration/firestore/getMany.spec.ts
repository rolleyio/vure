import '../../setup';

import { collection } from '../../../src/firestore/collection';
import set from '../../../src/firestore/set';
import getMany from '../../../src/firestore/getMany';
import remove from '../../../src/firestore/remove';

describe('getMany', () => {
  type Fruit = { color: string };

  const fruits = collection<Fruit>('fruits');

  before(async () => {
    await Promise.all([
      set(fruits, 'apple', { color: 'green' }),
      set(fruits, 'banana', { color: 'yellow' }),
      set(fruits, 'orange', { color: 'orange' }),
    ]);
  });

  after(async () => {
    await Promise.all([
      remove(fruits, 'apple'),
      remove(fruits, 'banana'),
      remove(fruits, 'orange'),
    ]);
  });

  it('returns nothing when called with empty array', async () => {
    const list = await getMany(fruits, []);
    expect(list.length).to.equal(0);
  });

  it('allows to get single doc by id', async () => {
    const fruitsFromDB = await getMany(fruits, ['apple']);
    expect(fruitsFromDB.length).to.equal(1);
    expect(fruitsFromDB[0].__type__).to.equal('doc');
    expect(fruitsFromDB[0].data.color).to.equal('green');
    expect(fruitsFromDB[0].ref.id).to.equal('apple');
    expect(fruitsFromDB[0].ref.collection.path).to.equal('fruits');
  });

  it('allows to get multiple docs by id', async () => {
    const fruitsFromDB = await getMany(fruits, [
      'banana',
      'apple',
      'banana',
      'orange',
    ]);
    expect(fruitsFromDB.length).to.equal(4);
    expect(fruitsFromDB[0].ref.id).to.equal('banana');
    expect(fruitsFromDB[1].ref.id).to.equal('apple');
    expect(fruitsFromDB[2].ref.id).to.equal('banana');
    expect(fruitsFromDB[3].ref.id).to.equal('orange');
  });

  it('throws an error when an id is missing', () =>
    getMany(fruits, ['nonexistant'])
      .then(() => {
        throw new Error('The promise should be rejected');
      })
      .catch((err) => {
        expect(err.message).to.equal(
          'Missing document with id nonexistant',
        );
      }));

  it('allows to specify custom logic when a document is not found', async () => {
    const list = await getMany(fruits, ['nonexistant'], (id) => ({
      color: `${id} is missing but I filled it in`,
    }));
    expect(list.length).to.equal(1);
    expect(list[0].data.color).to.equal(
      'nonexistant is missing but I filled it in',
    );
  });

  it('allows to ignore missing documents', async () => {
    const list = await getMany(
      fruits,
      ['apple', 'nonexistant', 'banana'],
      'ignore',
    );
    expect(list.length).to.equal(2);
  });
});
