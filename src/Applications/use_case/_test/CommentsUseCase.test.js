const AddComments = require('../../../Domains/comments/entities/AddComments');
const AddedComments = require('../../../Domains/comments/entities/AddedComments');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const ThreadsRepository = require('../../../Domains/threads/ThreadsRepository');
const CommentsUseCase = require('../CommentsUseCase');

describe('CommentUseCase', () => {
  describe('addComment', () => {
    it('should orchestrating the add comments correctly', async () => {
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

      // create use case depedency
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();

      // mock needed function
      mockThreadsRepository.validateThreadExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentsRepository.addComments = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedComments));
      mockCommentsRepository.addThreadsComments = jest.fn()
        .mockImplementation(() => Promise.resolve('thread_comment-123'));

      // create use case instance
      const getCommentsUseCase = new CommentsUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
      });

      // Action
      const addedComments = await getCommentsUseCase.addComment(useCasePayload);

      // Assert
      expect(addedComments).toStrictEqual(new AddedComments({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: 'user-123',
      }));

      expect(mockCommentsRepository.addComments)
        .toBeCalledWith(new AddComments(useCasePayload));
      expect(mockCommentsRepository.addThreadsComments)
        .toBeCalledWith({ threadId: 'thread-123', commentId: 'comment-123' });
      expect(mockThreadsRepository.validateThreadExist)
        .toBeCalledWith(useCasePayload.threadId);
    });
  });

  describe('deleteComment', () => {
    it('should orchestrating the delete comment by id action correctly', async () => {
    // Arrange
      const useCasePayload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      // create use case dependency
      const mockThreadsRepository = new ThreadsRepository();
      const mockCommentsRepository = new CommentsRepository();

      // mock needed function
      mockThreadsRepository.validateThreadExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentsRepository.validateCommentExist = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentsRepository.validateCommentOwner = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentsRepository.sofDeleteComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

      // create use case instance
      const getCommentsUseCase = new CommentsUseCase({
        threadsRepository: mockThreadsRepository,
        commentsRepository: mockCommentsRepository,
      });

      // Action
      await getCommentsUseCase.deleteComment(useCasePayload);

      // Assert
      expect(mockThreadsRepository.validateThreadExist)
        .toBeCalledWith(useCasePayload.threadId);
      expect(mockCommentsRepository.validateCommentExist)
        .toBeCalledWith(useCasePayload.commentId);
      expect(mockCommentsRepository.validateCommentOwner)
        .toBeCalledWith({ commentId: useCasePayload.commentId, userId: useCasePayload.userId });
      expect(mockCommentsRepository.sofDeleteComment)
        .toBeCalledWith(useCasePayload.commentId);
    });
  });
});
