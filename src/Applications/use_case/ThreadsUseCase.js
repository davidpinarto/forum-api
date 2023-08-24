const AddThread = require('../../Domains/threads/entities/AddThread');

class ThreadsUseCase {
  constructor({ threadsRepository, commentsRepository }) {
    this._threadsRepository = threadsRepository;
    this._commentsRepository = commentsRepository;
  }

  async addThread(useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    const addedThread = await this._threadsRepository.addThread(addThread);
    return addedThread;
  }

  async getThreadDetailById(useCasePayload) {
    const {
      id,
    } = useCasePayload;

    const thread = await this._threadsRepository.getThreadDetailById(id);
    const { comments } = await this._commentsRepository.getThreadDetailCommentsByThreadId(id);

    const threadDetail = {
      ...thread,
      comments,
    };

    return threadDetail;
  }
}

module.exports = ThreadsUseCase;
