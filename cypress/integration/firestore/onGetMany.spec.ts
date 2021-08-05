import '../../setup';

import onGetMany from '../../../src/firestore/onGetMany';
import { collection } from '../../../src/firestore/collection';
import update from '../../../src/firestore/update';
import set from '../../../src/firestore/set';

describe('onGetMany', () => {
  type Fruit = { color: string };

  const fruits = collection<Fruit>('fruits');

  before(async () => {
    await Promise.all([
      set(fruits, 'apple', { color: 'green' }),
      set(fruits, 'banana', { color: 'yellow' }),
      set(fruits, 'orange', { color: 'orange' }),
    ]);
  });

  let off: (() => void) | undefined;

  afterEach(() => {
    off && off();
    off = undefined;
  });

  it('returns nothing when called with empty array', () => {
    return new Promise((resolve) => {
      off = onGetMany(fruits, [], (list) => {
        expect(list.length).to.equal(0);
        resolve(true);
      });
    });
  });

  it('allows to get single doc by id', () => {
    return new Promise((resolve) => {
      off = onGetMany(fruits, ['apple'], (fruitsFromDB) => {
        expect(fruitsFromDB.length).to.equal(1);
        expect(fruitsFromDB[0].__type__).to.equal('doc');
        expect(fruitsFromDB[0].data.color).to.equal('green');
        expect(fruitsFromDB[0].ref.id).to.equal('apple');
        expect(fruitsFromDB[0].ref.collection.path).to.equal(
          'fruits',
        );
        resolve(true);
      });
    });
  });

  it('allows to get multiple docs by id', () => {
    return new Promise((resolve) => {
      off = onGetMany(
        fruits,
        ['banana', 'apple', 'banana', 'orange'],
        (fruitsFromDB) => {
          expect(fruitsFromDB.length).to.equal(4);
          expect(fruitsFromDB[0].ref.id).to.equal('banana');
          expect(fruitsFromDB[1].ref.id).to.equal('apple');
          expect(fruitsFromDB[2].ref.id).to.equal('banana');
          expect(fruitsFromDB[3].ref.id).to.equal('orange');
          resolve(true);
        },
      );
    });
  });

  // TODO: Find a way to enable missing ids handling

  // it('throws an error when an id is missing', () => {
  //   return new Promise((resolve, reject) => {
  //     off = onGetMany(
  //       fruits,
  //       ['nonexistant'],
  //       () => {
  //         reject(new Error('onResult should not been called'))
  //       },
  //       err => {
  //         expect(err.message).to.equal('Missing document with id nonexistant')
  //         resolve()
  //       }
  //     )
  //   })
  // })

  // it('allows to specify custom logic when a document is not found', () => {
  //   return new Promise(resolve => {
  //     off = onGetMany(
  //       fruits,
  //       ['nonexistant'],
  //       list => {
  //         expect(list.length).to.equal(1)
  //         expect(list[0].data.color).to.equal(
  //           'nonexistant is missing but I filled it in'
  //         )
  //         resolve()
  //       },
  //       null,
  //       id => ({
  //         color: `${id} is missing but I filled it in`
  //       })
  //     )
  //   })
  // })

  // it('allows to ignore missing documents', () => {
  //   return new Promise(resolve => {
  //     off = onGetMany(
  //       fruits,
  //       ['apple', 'nonexistant', 'banana'],
  //       list => {
  //         expect(list.length).to.equal(2)
  //         resolve()
  //       },
  //       null,
  //       'ignore'
  //     )
  //   })
  // })

  describe('real-time', () => {
    it('subscribes to updates', async () => {
      await Promise.all([
        set(fruits, 'apple', { color: 'green' }),
        set(fruits, 'mango', { color: 'green' }),
      ]);

      setTimeout(() => {
        update(fruits, 'mango', { color: 'yellow' });
      });

      return new Promise((resolve) => {
        off = onGetMany(fruits, ['apple', 'mango'], (list) => {
          const colorOf = (id: string) =>
            list.find((doc) => doc.ref.id === id)!.data.color;

          if (colorOf('mango') === 'yellow') {
            update(fruits, 'mango', { color: 'red' });
            update(fruits, 'apple', { color: 'red' });
          }
          if (
            colorOf('mango') === 'red' &&
            colorOf('apple') === 'red'
          ) {
            resolve();
          }
        });
      });
    });
  });
});
