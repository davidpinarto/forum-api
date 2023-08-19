const ThreadsRepository = require('../ThreadsRepository');

describe('ThreadsRepository Interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadsRepository = new ThreadsRepository();

    // Action and Assert
    await expect(threadsRepository.addThread({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.getThreadDetailById('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.addComments('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.addThreadsComments({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.getThreadDetailCommentsByThreadId('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.validateThreadExist('')).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.validateCommentExist({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.getCommentOwnerByCommentId({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.sofDeleteComment({})).rejects.toThrowError('THREADS_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
