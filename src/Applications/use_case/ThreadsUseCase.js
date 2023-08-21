const AddThread = require('../../Domains/threads/entities/AddThread');
const { mapDBThreadDetailToModel } = require('../../Commons/utils/mapDBThreadDetailToModel');

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

    const thread = await this._threadsRepository.getThreadDetailById(id);
    const threadComments = await this._commentsRepository.getThreadDetailCommentsByThreadId(id);

    const sortCommentsByDate = threadComments
      .map(mapDBThreadDetailToModel)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const checkDeletedComments = sortCommentsByDate.map((comment) => {
      if (comment.isDeleted) {
        comment.content = '**komentar telah dihapus**';
        delete comment.isDeleted;
        return comment;
      }
      delete comment.isDeleted;
      return comment;
    });

    return { thread, comments: checkDeletedComments };
  }
}

module.exports = ThreadsUseCase;
