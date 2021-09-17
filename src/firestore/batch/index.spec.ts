/// <reference types="cypress" />
import '../__test__/setup';

import { nanoid } from 'nanoid';

import { batch } from '../batch';
import { collection } from '../collection';
import { ref } from '../ref';
import get from '../get';
import set from '../set';

describe('batch', () => {
  type User = { name: string; foo?: boolean };
  const users = collection<User>('users');

  it('performs batch operations', async () => {
    const { set, commit } = batch();
    const id = nanoid();
    const sashaRef = ref(users, `${id}-sasha`);
    const tatiRef = ref(users, `${id}-tati`);
    const edRef = ref(users, `${id}-ed`);
    set(sashaRef, { name: 'Sasha' });
    set(tatiRef, { name: 'Tati' });
    set(edRef, { name: 'Ed' });
    await commit();
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef),
    ]);
    expect(sasha!.data.name).to.eq('Sasha');
    expect(tati!.data.name).to.eq('Tati');
    expect(ed!.data.name).to.eq('Ed');
  });

  it('allows set a new document', async () => {
    const { set, commit } = batch();
    const id = nanoid();
    const sashaRef = ref(users, `${id}-sasha`);
    const tatiRef = ref(users, `${id}-tati`);
    const edRef = ref(users, `${id}-ed`);
    set(sashaRef, { name: 'Sasha' });
    set(tatiRef, { name: 'Tati' });
    set(edRef, { name: 'Ed' });
    await commit();
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef),
    ]);
    expect(sasha).to.deep.equal({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-sasha` },

      data: { name: 'Sasha' },
    });
    expect(tati).to.deep.equal({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-tati` },

      data: { name: 'Tati' },
    });
    expect(ed).to.deep.equal({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-ed` },

      data: { name: 'Ed' },
    });
  });

  it('allows upsetting', async () => {
    const { upset, commit } = batch();
    const id = nanoid();
    const sashaRef = ref(users, `${id}-sasha`);
    const tatiRef = ref(users, `${id}-tati`);
    const edRef = ref(users, `${id}-ed`);
    await Promise.all([
      set(sashaRef, { name: 'Sasha', foo: true }),
      set(tatiRef, { name: 'Tati', foo: true }),
      set(edRef, { name: 'Ed', foo: true }),
    ]);
    upset(sashaRef, { name: 'Sasha Koss' });
    upset(tatiRef, { name: 'Tati Shepeleva', foo: false });
    upset(edRef, { name: 'Ed Tsech' });
    await commit();
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef),
    ]);
    expect(sasha!.data).to.deep.equal({
      name: 'Sasha Koss',
      foo: true,
    });
    expect(tati!.data).to.deep.equal({
      name: 'Tati Shepeleva',
      foo: false,
    });
    expect(ed!.data).to.deep.equal({ name: 'Ed Tsech', foo: true });
  });

  it('allows updating', async () => {
    const { update, commit } = batch();
    const id = nanoid();
    const sashaRef = ref(users, `${id}-sasha`);
    const tatiRef = ref(users, `${id}-tati`);
    const edRef = ref(users, `${id}-ed`);
    await Promise.all([
      set(sashaRef, { name: 'Sasha' }),
      set(tatiRef, { name: 'Tati' }),
      set(edRef, { name: 'Ed' }),
    ]);
    update(sashaRef, { name: 'Sasha Koss' });
    update(tatiRef, { name: 'Tati Shepeleva' });
    update(edRef, { name: 'Ed Tsech' });
    await commit();
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef),
    ]);
    expect(sasha!.data.name).to.equal('Sasha Koss');
    expect(tati!.data.name).to.equal('Tati Shepeleva');
    expect(ed!.data.name).to.equal('Ed Tsech');
  });

  it('allows removing', async () => {
    const { remove, commit } = batch();
    const id = nanoid();
    const sashaRef = ref(users, `${id}-sasha`);
    const tatiRef = ref(users, `${id}-tati`);
    const edRef = ref(users, `${id}-ed`);
    await Promise.all([
      set(sashaRef, { name: 'Sasha' }),
      set(tatiRef, { name: 'Tati' }),
      set(edRef, { name: 'Ed' }),
    ]);
    remove(sashaRef);
    remove(tatiRef);
    remove(edRef);
    await commit();
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef),
    ]);
    expect(sasha).to.be.null;
    expect(tati).to.be.null;
    expect(ed).to.be.null;
  });
});
