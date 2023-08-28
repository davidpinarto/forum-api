const AddThread = require('../../Domains/threads/entities/AddThread');

class ThreadsUseCase {
  constructor({ threadsRepository, commentsRepository }) {
    this._threadsRepository = threadsRepository;
    this._commentsRepository = commentsRepository;
  }

  async addThread(useCasePayload) {
    const addThread = new AddThread(useCasePayload);
    return this._threadsRepository.addThread(addThread);
  }

  async getThreadDetailById(useCasePayload) {
    const {
      id,
    } = useCasePayload;

    const threadDetail = {
      ...(await this._threadsRepository.getThreadDetailById(id)),
      ...(await this._commentsRepository.getThreadDetailCommentsByThreadId(id)),
    };

    return threadDetail;
  }
}

module.exports = ThreadsUseCase;
