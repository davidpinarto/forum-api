const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadsRepositoryPostgres = require('../ThreadsRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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

      const checkAddedThread = await ThreadsTableTestHelper.checkAddedThread('thread-123');
      expect(checkAddedThread).toHaveLength(1);
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

      const date = new Date().toISOString();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
        username: 'david',
        title: 'Thread Title',
        body: 'Thread body',
        date,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const threadDetail = await threadsRepositoryPostgres.getThreadDetailById('thread-123');

      // Assert
      expect(threadDetail).toEqual({
        id: 'thread-123',
        username: 'david',
        title: 'Thread Title',
        body: 'Thread body',
        date,
      });
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

    it('should not throw error if thread is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const threadsRepositoryPostgres = new ThreadsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadsRepositoryPostgres.validateThreadExist('thread-123'))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });
});
