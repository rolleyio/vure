import fs from 'fs';
import firebase from '@firebase/rules-unit-testing';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';

const rules = fs
  .readFileSync('./src/firebase/firestore.rules')
  .toString('utf-8');

expect.extend({
  async toAllow(x) {
    let pass = false;

    try {
      await firebase.assertSucceeds(x);
      pass = true;
    } catch (err) {}

    return Promise.resolve({
      pass,
      message: () =>
        'Expect allowed firebase operation but it failed.',
    });
  },
  async toDeny(x) {
    let pass = false;

    try {
      await firebase.assertFails(x);
      pass = true;
    } catch (err) {}

    return {
      pass,
      message: () =>
        'Expected denied firebase operation but it was allowed.',
    };
  },
});

export const setup = async (
  auth?: TokenOptions,
  data?: Record<string, any>,
) => {
  const projectId = `rules-spec-${Date.now()}`;
  const app = firebase.initializeTestApp({ projectId, auth });

  const db = app.firestore();

  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  await firebase.loadFirestoreRules({
    projectId,
    rules,
  });

  return db;
};

export const teardown = async () => {};
