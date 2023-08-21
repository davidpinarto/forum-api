const CommentsRepository = require('../CommentsRepository');

describe('CommentsRepository Interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentsRepository = new CommentsRepository();

    // Action and Assert
    await expect(commentsRepository.addComments('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentsRepository.addThreadsComments({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentsRepository.getThreadDetailCommentsByThreadId('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentsRepository.validateCommentExist({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentsRepository.validateCommentOwner({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentsRepository.sofDeleteComment({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
