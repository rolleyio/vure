/// <reference types="cypress" />
import '../__test__/setup';

import { nanoid } from 'nanoid';

import { transaction } from '../transaction';
import { collection } from '../collection';
import set from '../set';
import { ref, Ref } from '../ref';
import get from '../get';

describe('transaction', () => {
  type Counter = { count: number; optional?: true };
  const counters = collection<Counter>('counters');

  const plusOne = async (
    counter: Ref<Counter>,
    useUpdate?: boolean,
  ) =>
    transaction(
      async ({ get }) => {
        const item = await get(counter);
        return item!.data.count;
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
    const item = await get(counter);
    expect(item!.data.count).to.equal(3);
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
    expect(results.sort()).to.eql([1, 2, 3]);
  });

  it('allows upsetting', async () => {
    const id = nanoid();
    const counter = ref(counters, id);
    await set(counter, { count: 0, optional: true });
    await transaction(
      ({ get }) => get(counter),
      async ({ data: counterFromDB, upset }) =>
        upset(counter, { count: counterFromDB!.data.count + 1 }),
    );
    const item = await get(counter);

    expect(item!.data.count).to.equal(1);
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
            count: counterFromDB!.data.count + 1,
            optional: true,
          }),
      ),
    ]);
    const item = await get(counter);
    expect(item!.data.count).to.equal(2);
    expect(item!.data.optional).to.be.true;
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
    expect(!counterFromDB).to.be.true;
  });
});
