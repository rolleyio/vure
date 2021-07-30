import { initializeFirebaseApp, initializeFirestore } from '../../';
import { nanoid } from 'nanoid';

import { batch } from '.';
import { collection } from '../collection';
import { ref } from '../ref';
import get from '../get';
import set from '../set';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('batch', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

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
    expect(sasha.data.name).toBe('Sasha');
    expect(tati.data.name).toBe('Tati');
    expect(ed.data.name).toBe('Ed');
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
    expect(sasha).toEqual({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-sasha` },
      meta: {
        fromCache: false,
        hasPendingWrites: false,
      },
      data: { name: 'Sasha' },
    });
    expect(tati).toEqual({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-tati` },
      meta: {
        fromCache: false,
        hasPendingWrites: false,
      },
      data: { name: 'Tati' },
    });
    expect(ed).toEqual({
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id: `${id}-ed` },
      meta: {
        fromCache: false,
        hasPendingWrites: false,
      },
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
    expect(sasha.data).toEqual({
      name: 'Sasha Koss',
      foo: true,
    });
    expect(tati.data).toEqual({
      name: 'Tati Shepeleva',
      foo: false,
    });
    expect(ed.data).toEqual({ name: 'Ed Tsech', foo: true });
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
    expect(sasha.data.name).toEqual('Sasha Koss');
    expect(tati.data.name).toEqual('Tati Shepeleva');
    expect(ed.data.name).toEqual('Ed Tsech');
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
    expect(sasha).toBeNull();
    expect(tati).toBeNull();
    expect(ed).toBeNull();
  });
});
