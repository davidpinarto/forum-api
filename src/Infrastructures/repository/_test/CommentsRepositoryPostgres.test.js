const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentsRepositoryPostgres = require('../CommentsRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComments = require('../../../Domains/comments/entities/AddComments');
const AddedComments = require('../../../Domains/comments/entities/AddedComments');
const GetComments = require('../../../Domains/comments/entities/GetComments');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentsRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
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
      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, fakeIdGenerator);

      const addComment = new AddComments(commentPayload);

      // Action
      const addedComments = await commentsRepositoryPostgres.addComments(addComment);

      // Assert
      expect(addedComments).toEqual(new AddedComments({
        id: 'comment-123',
        content: commentPayload.content,
        owner: commentPayload.userId,
      }));

      const checkAddedComments = await CommentsTableTestHelper.checkAddedComments('comment-123');
      expect(checkAddedComments).toHaveLength(1);
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

      await CommentsTableTestHelper.addComments({});

      const fakeIdGenerator = () => '123'; // stub!
      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThreadCommentId = await commentsRepositoryPostgres
        .addThreadsComments({ threadId: 'thread-123', commentId: 'comment-123' });

      // Assert
      expect(addedThreadCommentId).toEqual('thread_comment-123');

      const checkThreadsCommentsConstraint = await CommentsTableTestHelper.checkThreadsCommentsConstraint('thread_comment-123');
      expect(checkThreadsCommentsConstraint).toHaveLength(1);
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
      const date = new Date().toISOString();

      await CommentsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date,
      });
      await CommentsTableTestHelper.addComments({
        id: 'comment-234',
        owner: 'user-345',
        username: 'jonggun',
        content: 'Comment content',
        date,
      });

      // add threads constraint with comments table
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-234',
        threadId: 'thread-123',
        commentId: 'comment-234',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comments = await commentsRepositoryPostgres.getThreadDetailCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toEqual(new GetComments([
        {
          id: 'comment-123',
          username: 'shibainu',
          date,
          content: 'Comment content',
          isDeleted: false,
        },
        {
          id: 'comment-234',
          username: 'jonggun',
          date,
          content: 'Comment content',
          isDeleted: false,
        },
      ]));
    });
  });

  describe('validateCommentExist function', () => {
    it('should throw error if comment not exist', async () => {
      // Arrange
      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.validateCommentExist('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error if comment is exist', async () => {
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

      // user-234 add comment
      await CommentsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.validateCommentExist('comment-123'))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('validateCommentOwner function', () => {
    it('should throw Authorization error if the owner comment is not equal with userId', async () => {
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
      await CommentsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.validateCommentOwner({
        commentId: 'comment-123',
        userId: 'user-123',
      }))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw error if comment owner is equal with userId', async () => {
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

      // user-234 add comment
      await CommentsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.validateCommentOwner({
        commentId: 'comment-123',
        userId: 'user-234',
      }))
        .resolves
        .not
        .toThrowError(AuthorizationError);
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
      await CommentsTableTestHelper.addComments({
        id: 'comment-123',
        owner: 'user-234',
        username: 'shibainu',
        content: 'Comment content',
        date: new Date().toISOString(),
      });

      // add threads constraint with comments table
      await CommentsTableTestHelper.addThreadsComments({
        id: 'threads_comments-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.sofDeleteComment('comment-123'))
        .resolves
        .not
        .toThrowError(InvariantError);

      const checkDeletedComment = await CommentsTableTestHelper.checkIsDeletedComment('comment-123');
      expect(checkDeletedComment.is_deleted).toEqual(true);
    });

    it('should throw error when failed to delete thread', async () => {
      // Arrange
      const commentsRepositoryPostgres = new CommentsRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentsRepositoryPostgres.sofDeleteComment('comment-123'))
        .rejects
        .toThrowError(InvariantError);
    });
  });
});
