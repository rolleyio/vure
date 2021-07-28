import { setup, teardown } from './';

describe('Database Rules', () => {
  afterAll(async () => {
    teardown();
  });

  describe('comments', () => {
    test('Should fail to start with', async () => {
      const db = await setup();
      const commentsRef = db.collection('comments');
      expect(commentsRef.get()).toDeny();
    });

    test('Should succeed to start with', async () => {
      const db = await setup({
        uid: 'matt',
        email: 'matt@rolley.io',
      });
      const commentsRef = db.collection('comments');
      expect(commentsRef.get()).toAllow();
    });
  });
});
