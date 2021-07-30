import { subcollection } from '.';
import { Ref, ref } from '../ref';
import { collection } from '../collection';
import { initializeFirebaseApp, initializeFirestore } from '../../';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

initializeFirebaseApp({
  projectId: 'vure',
});
initializeFirestore({ enabled: true });

describe('Subcollection', () => {
  afterAll(() => {
    clearFirestoreData({ projectId: 'vure' });
  });

  type User = { name: string };
  type Post = { author: Ref<User>; text: string; date?: Date };
  type Comment = { author: Ref<User>; text: string; date?: Date };
  type Like = { author: Ref<User> };
  const users = collection<User>('users');

  describe('subcollection', () => {
    it('creates subcollection function', () => {
      const userRef = ref(users, '42');
      const userPosts = subcollection<Post, User>('posts', users);
      expect(userPosts(userRef)).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts',
      });
    });

    it('allows to pass parent document id', () => {
      const userPosts = subcollection<Post, User>('posts', users);
      expect(userPosts('42')).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts',
      });
    });

    it('allows creating nested subcollections', () => {
      const userPosts = subcollection<Post, User>('posts', users);
      const postComments = subcollection<Comment, Post, User>(
        'comments',
        userPosts,
      );
      const commentLikes = subcollection<
        Like,
        Comment,
        Post,
        [string, string]
      >('likes', postComments);

      const user = ref(users, '42');
      const post = ref(userPosts(user), '69');
      const comment = ref(postComments(post), '13');

      expect(postComments(post)).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts/69/comments',
      });
      expect(postComments(['42', '69'])).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts/69/comments',
      });

      expect(commentLikes(comment)).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts/69/comments/13/likes',
      });
      expect(commentLikes(['42', '69', '13'])).toStrictEqual({
        __type__: 'collection',
        path: 'users/42/posts/69/comments/13/likes',
      });
    });
  });
});
