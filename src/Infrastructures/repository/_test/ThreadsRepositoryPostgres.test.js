const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadsRepositoryPostgres = require('../ThreadsRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComments = require('../../../Domains/threads/entities/AddComments');
const AddedComments = require('../../../Domains/threads/entities/AddedComments');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadsRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const addUser = {
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      };

      await UsersTableTestHelper.addUser(addUser);

      const threadPayload = {
        title: 'Thread Title',
        body: 'Thread body',
        userId: 'user-123',
        username: 'david',
      };

      const addThread = new AddThread(threadPayload);
      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const thread = await threadsRepositoryPostgres.addThread(addThread);

      // Assert
      expect(thread).toEqual(new AddedThread({
        id: 'thread-123',
        title: threadPayload.title,
        owner: addUser.id,
      }));
    });
  });

  describe('addComments function', () => {
    it('should persist comments and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'shibainu',
        password: 'secret',
        fullname: 'Shiba Inu',
      });

      await ThreadsTableTestHelper.addThread({});

      const commentPayload = {
        userId: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        threadId: 'thread-123',
      };

      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      const addComment = new AddComments(commentPayload);

      // Action
      const addedComments = await threadsRepositoryPostgres.addComments(addComment);

      // Assert
      expect(addedComments).toEqual(new AddedComments({
        id: 'comment-123',
        content: commentPayload.content,
        owner: commentPayload.userId,
      }));
    });
  });

  describe('addThreadsComments function', () => {
    it('should persist threads comment on threads_comments database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'shibainu',
        password: 'secret',
        fullname: 'Shiba Inu',
      });

      await ThreadsTableTestHelper.addThread({});

      await ThreadsTableTestHelper.addComments({});

      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThreadCommentId = await threadsRepositoryPostgres
        .addThreadsComments({ threadId: 'thread-123', commentId: 'comment-123' });

      // Assert
      expect(addedThreadCommentId).toMatch('comment-123');
    });
  });

  describe('getThreadDetailById function', () => {
    it('should throw error when thread not found', async () => {
      // Arrange
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadsRepositoryPostgres.getThreadDetailById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread data when thread was found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });

      await ThreadsTableTestHelper.addThread({});

      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const threadDetail = await threadsRepositoryPostgres.getThreadDetailById('thread-123');

      // Assert
      expect(threadDetail).toBeDefined();
    });
  });

  describe('getThreadDetailCommentsByThreadId function', () => {
    it('should return comments on thread when comments was found', async () => {
      // Arrange
      // create user
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'shibainu',
        password: 'secret',
        fullname: 'Shiba Inu',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-345',
        username: 'jonggun',
        password: 'secret',
        fullname: 'Jonggun',
      });

      await ThreadsTableTestHelper.addThread({});

      // user-234 & user-345 add comment
      await ThreadsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });
      await ThreadsTableTestHelper.addComments({
        id: 'comment-234',
        owner: 'user-345',
        username: 'jonggun',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await ThreadsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      await ThreadsTableTestHelper.addThreadsComments({
        id: 'threads_comments-234',
        threadId: 'thread-123',
        commentId: 'comment-234',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comments = await threadsRepositoryPostgres.getThreadDetailCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
    });
  });

  describe('validateThreadExist function', () => {
    it('should throw error if thread not exist', async () => {
      // Arrange
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadsRepositoryPostgres.validateThreadExist('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('validateCommentExist function', () => {
    it('should throw error if thread not exist', async () => {
      // Arrange
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadsRepositoryPostgres.validateThreadExist('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });

  describe('getCommentOwnerByCommentId function', () => {
    it('should return comment owner correctly', async () => {
      // Arrange
      // create user
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'shibainu',
        password: 'secret',
        fullname: 'Shiba Inu',
      });

      await ThreadsTableTestHelper.addThread({});

      // user-234 comment
      await ThreadsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await ThreadsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action
      const { owner } = await threadsRepositoryPostgres.getCommentOwnerByCommentId('comment-123');

      // Assert
      expect(owner).toMatch('user-234');
    });
  });

  describe('sofDeleteComment function', () => {
    it('should soft delete comment correctly', async () => {
      // Arrange
      // create user
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'david',
        password: 'secret',
        fullname: 'David Pinarto',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'shibainu',
        password: 'secret',
        fullname: 'Shiba Inu',
      });

      await ThreadsTableTestHelper.addThread({});

      // user-234 add comment
      await ThreadsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await ThreadsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      expect(await threadsRepositoryPostgres.sofDeleteComment('comment-123')).toEqual('comment-123');
    });

    it('should throw error when failed to delete thread', async () => {
      // Arrange
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadsRepositoryPostgres.sofDeleteComment('comment-123'))
        .rejects
        .toThrowError(InvariantError);
    });
  });
});
