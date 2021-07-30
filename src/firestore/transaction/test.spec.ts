import { initializeFirebaseApp, initializeFirestore } from '../../';
import { nanoid } from 'nanoid';

import { transaction } from '.';
import { collection } from '../collection';
import set from '../set';
import { ref, Ref } from '../ref';
import get from '../get';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('transaction', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type Counter = { count: number; optional?: true };
  const counters = collection<Counter>('counters');

  beforeEach(() => {
    typeof jest !== 'undefined' && jest.setTimeout(20000);
  });

  const plusOne = async (
    counter: Ref<Counter>,
    useUpdate?: boolean,
  ) =>
    transaction(
      async ({ get }) => {
        const {
          data: { count },
        } = await get(counter);
        return count;
      },
      async ({ data: count, set, update }) => {
        const newCount = count + 1;
        const payload = { count: newCount };
        if (useUpdate) {
          await update(counter, payload);
        } else {
          await set(counter, payload);
        }
        return newCount;
      },
    );

  it('performs transaction', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0 });
    await Promise.all([
      plusOne(counter),
      plusOne(counter),
      plusOne(counter),
    ]);
    const {
      data: { count },
    } = await get(counter);
    expect(count).toBe(3);
  });

  it('returns the value from the write function', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0 });
    const results = await Promise.all([
      plusOne(counter),
      plusOne(counter),
      plusOne(counter),
    ]);
    expect(results.sort()).toStrictEqual([1, 2, 3]);
  });

  it('allows upsetting', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0, optional: true });
    await transaction(
      ({ get }) => get(counter),
      async ({ data: counterFromDB, upset }) =>
        upset(counter, { count: counterFromDB.data.count + 1 }),
    );
    const {
      data: { count, optional },
    } = await get(counter);

    expect(count).toBe(1);
    expect(optional).toBeTruthy();
  });

  it('allows updating', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0 });
    await Promise.all([
      plusOne(counter, true),
      transaction(
        ({ get }) => get(counter),
        async ({ data: counterFromDB, update }) =>
          update(counter, {
            count: counterFromDB.data.count + 1,
            optional: true,
          }),
      ),
    ]);
    const {
      data: { count, optional },
    } = await get(counter);
    expect(count).toBe(2);
    expect(optional).toBeTruthy();
  });

  it('allows removing', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0 });
    await Promise.all([
      plusOne(counter, true),
      transaction(
        ({ get }) => get(counter),
        async ({ remove }) => remove(counter),
      ),
    ]);
    const counterFromDB = await get(counter);
    expect(!counterFromDB).toBeTruthy();
  });
});
