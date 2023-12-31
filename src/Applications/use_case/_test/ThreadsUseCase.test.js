const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const GetComments = require('../../../Domains/comments/entities/GetComments');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const ThreadsUseCase = require('../ThreadsUseCase');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');

describe('ThreadsUseCase', () => {
  describe('addThread', () => {
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

      const mockThreadsRepository = new ThreadsRepository();

      mockThreadsRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedThread));

      const getThreadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: {},
      });

      // Action
      const addedThread = await getThreadsUseCase.addThread(useCasePayload);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.userId,
      }));

      expect(mockThreadsRepository.addThread)
        .toBeCalledWith(new AddThread(useCasePayload));
    });
  });

  describe('getThreadDetailById', () => {
    it('should orchestrating the get thread detail by id action correctly', async () => {
      // Arrange
      const useCasePayload = {
        id: 'thread-123',
      };
      const date = new Date().toISOString();

      const expectedThreadValue = {
        id: useCasePayload.id,
        title: 'Thread Title',
        body: 'Thread body',
        date,
        username: 'david',
        comments: [
          {
            id: 'comment-123',
            username: 'jonggun',
            date,
            content: 'Comment content',
          },
          {
            id: 'comment-234',
            username: 'gimyung',
            date,
            content: '**komentar telah dihapus**',
          },
        ],
      };

      // create use case dependency
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();

      // mock needed function
      mockThreadsRepository.getThreadDetailById = jest.fn()
        .mockImplementation(() => Promise.resolve({
          id: 'thread-123',
          title: 'Thread Title',
          body: 'Thread body',
          date,
          username: 'david',
        }));
      mockCommentsRepository.getThreadDetailCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(new GetComments(
          [
            {
              id: 'comment-123',
              username: 'jonggun',
              date,
              content: 'Comment content',
              is_deleted: false,
            },
            {
              id: 'comment-234',
              username: 'gimyung',
              date,
              content: 'Comment content',
              is_deleted: true,
            },
          ],
        )));

      // create use case instance
      const threadsUseCase = new ThreadsUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
      });

      // Action
      const thread = await threadsUseCase.getThreadDetailById(useCasePayload);

      // Assert
      expect(thread).toStrictEqual(expectedThreadValue);

      expect(mockThreadsRepository.getThreadDetailById)
        .toBeCalledWith(useCasePayload.id);
      expect(mockCommentsRepository.getThreadDetailCommentsByThreadId)
        .toBeCalledWith(useCasePayload.id);
    });
  });
});
