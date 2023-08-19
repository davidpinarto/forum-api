const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddComments = require('../../../Domains/threads/entities/AddComments');
const AddedComments = require('../../../Domains/threads/entities/AddedComments');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const ThreadsUseCase = require('../ThreadsUseCase');

describe('ThreadsUseCase', () => {
  describe('addThread', () => {
    it('should throw error if use case payload not contain needed property ', async () => {
      // Arrange
      const useCasePayload = {
        body: 'Thread body',
        userId: 'user-123',
        username: 'david',
      };

      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.addThreads(useCasePayload))
        .rejects
        .toThrowError('ADD_THREAD_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if use case payload data type not string', async () => {
      // Arrange
      const useCasePayload = {
        title: 123,
        body: 'Thread body',
        userId: 'user-123',
        username: 'david',
      };

      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.addThreads(useCasePayload))
        .rejects
        .toThrowError('ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the add thread correctly', async () => {
      // Arrange
      const useCasePayload = {
        title: 'Thread Title',
        body: 'Thread body',
        userId: 'user-123',
        username: 'david',
      };

      const mockAddedThread = new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.userId,
      });

      const mockUserRepository = new UserRepository();
      const mockThreadsRepository = new ThreadsRepository();

      mockUserRepository.getIdByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadsRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedThread));

      const getThreadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        userRepository: mockUserRepository,
      });

      // Action
      const addedThread = await getThreadsUseCase.addThreads(useCasePayload);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.userId,
      }));

      expect(mockThreadsRepository.addThread)
        .toBeCalledWith(new AddThread({ ...useCasePayload }));
      expect(mockUserRepository.getIdByUsername)
        .toBeCalledWith(useCasePayload.username);
    });
  });

  describe('addComments', () => {
    it('should throw error if use case payload not contain needed property ', async () => {
      // Arrange
      const useCasePayload = {
        userId: 'user-123',
        username: 'david',
        content: 'Comment content',
      };

      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.addComments(useCasePayload))
        .rejects
        .toThrowError('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if use case payload data type not string', async () => {
      // Arrange
      const useCasePayload = {
        userId: 'user-123',
        username: 'david',
        threadId: 123,
        content: 'Comment content',
      };

      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.addComments(useCasePayload))
        .rejects
        .toThrowError('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the add thread correctly', async () => {
      // Arrange
      const useCasePayload = {
        userId: 'user-123',
        username: 'david',
        threadId: 'thread-123',
        content: 'Comment content',
      };

      const mockAddedComments = new AddedComments({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: 'user-123',
      });

      const mockAddThreadsComments = {
        id: 'thread_comment-123',
      };

      // create use case depedency
      const mockUserRepository = new UserRepository();
      const mockThreadsRepository = new ThreadsRepository();

      // mock needed function
      mockUserRepository.getIdByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadsRepository.validateThreadExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadsRepository.addComments = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedComments));
      mockThreadsRepository.addThreadsComments = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddThreadsComments));

      // create use case instance
      const getThreadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        userRepository: mockUserRepository,
      });

      // Action
      const addedComments = await getThreadsUseCase.addComments(useCasePayload);

      // Assert
      expect(addedComments).toStrictEqual(new AddedComments({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: 'user-123',
      }));

      expect(mockThreadsRepository.addComments)
        .toBeCalledWith(new AddComments(useCasePayload));
      expect(mockThreadsRepository.addThreadsComments)
        .toBeCalledWith({ threadId: 'thread-123', commentId: 'comment-123' });
      expect(mockThreadsRepository.validateThreadExist)
        .toBeCalledWith(useCasePayload.threadId);
      expect(mockUserRepository.getIdByUsername)
        .toBeCalledWith(useCasePayload.username);
    });
  });

  describe('getThreadDetailById', () => {
    it('should throw error if use case payload not contain thread id', async () => {
      // Arrange
      const useCasePayload = {};
      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.getThreadDetailById(useCasePayload))
        .rejects
        .toThrowError('GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if use case payload data type not string', async () => {
      // Arrange
      const useCasePayload = { id: 123 };
      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.getThreadDetailById(useCasePayload))
        .rejects
        .toThrowError('GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the get thread detail by id action correctly', async () => {
      // Arrange
      const useCasePayload = {
        id: 'thread-123',
      };
      const createDate = new Date().toISOString();

      const expectedThreadValue = {
        id: useCasePayload.id,
        title: 'Thread Title',
        body: 'Thread body',
        date: createDate,
        username: 'david',
      };

      const expectedCommentsValue = [
        {
          id: 'comment-123',
          username: 'jonggun',
          date: createDate,
          content: 'Comment content',
        },
        {
          id: 'comment-234',
          username: 'gimyung',
          date: createDate,
          content: '**komentar telah dihapus**',
        },
      ];

      // create use case dependency
      const mockThreadsRepository = new ThreadsRepository();
      const mockUserRepository = new UserRepository();

      // mock needed function
      mockThreadsRepository.getThreadDetailById = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'thread-123',
          title: 'Thread Title',
          body: 'Thread body',
          date: createDate,
          username: 'david',
        }));
      mockThreadsRepository.getThreadDetailCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve([
          {
            id: 'comment-123',
            username: 'jonggun',
            date: createDate,
            content: 'Comment content',
            is_deleted: false,
          },
          {
            id: 'comment-234',
            username: 'gimyung',
            date: createDate,
            content: 'Comment content',
            is_deleted: true,
          },
        ]));

      // create use case instance
      const getThreadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        userRepository: mockUserRepository,
      });

      // Action
      const { thread, comments } = await getThreadsUseCase.getThreadDetailById(useCasePayload);

      // Assert
      expect(thread).toStrictEqual(expectedThreadValue);

      expect(comments).toStrictEqual(expectedCommentsValue);

      expect(mockThreadsRepository.getThreadDetailById)
        .toBeCalledWith(useCasePayload.id);
      expect(mockThreadsRepository.getThreadDetailCommentsByThreadId)
        .toBeCalledWith(useCasePayload.id);
    });
  });

  describe('deleteCommentOnThreadByCommentId', () => {
    it('should throw error if payload did not contain needed property', async () => {
      // Arrange
      const useCasePayload = {};
      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.deleteCommentOnThreadByCommentId(useCasePayload))
        .rejects
        .toThrowError('DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if use case payload data type not string', async () => {
      // Arrange
      const useCasePayload = {
        userId: 123,
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const getThreadsUseCase = new ThreadsUseCase({});

      // Action & Assert
      await expect(getThreadsUseCase.deleteCommentOnThreadByCommentId(useCasePayload))
        .rejects
        .toThrowError('DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the detele comment by id action correctly', async () => {
      // Arrange
      const useCasePayload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      // create use case dependency
      const mockThreadsRepository = new ThreadsRepository();
      const mockUserRepository = new UserRepository();

      // mock needed function
      mockThreadsRepository.validateThreadExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadsRepository.validateCommentExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadsRepository.getCommentOwnerByCommentId = jest.fn()
        .mockImplementation(() => Promise.resolve({
          owner: 'user-123',
        }));
      mockThreadsRepository.sofDeleteComment = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'comment-123',
        }));

      // create use case instance
      const getThreadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        userRepository: mockUserRepository,
      });

      // Action
      await getThreadsUseCase.deleteCommentOnThreadByCommentId(useCasePayload);

      // Assert
      expect(mockThreadsRepository.validateThreadExist)
        .toBeCalledWith(useCasePayload.threadId);
      expect(mockThreadsRepository.validateCommentExist)
        .toBeCalledWith(useCasePayload.commentId);
      expect(mockThreadsRepository.getCommentOwnerByCommentId)
        .toBeCalledWith(useCasePayload.commentId);
      expect(mockThreadsRepository.sofDeleteComment)
        .toBeCalledWith(useCasePayload.commentId);
    });
  });
});
