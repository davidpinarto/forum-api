const AddThread = require('../../Domains/threads/entities/AddThread');
const AddComments = require('../../Domains/threads/entities/AddComments');
const { mapDBThreadDetailToModel } = require('../../Commons/utils/mapDBThreadDetailToModel');

class ThreadsUseCase {
  constructor({ threadsRepository, userRepository }) {
    this._threadsRepository = threadsRepository;
    this._userRepository = userRepository;
  }

  async addThreads(useCasePayload) {
    const {
      userId, username, title, body,
    } = useCasePayload;
    this._validateAddThreadsUseCasePayload({
      title, body, userId, username,
    });
    await this._userRepository.getIdByUsername(username);
    const addThread = new AddThread(useCasePayload);

    return this._threadsRepository.addThread(addThread);
  }

  async addComments(useCasePayload) {
    const {
      userId, username, threadId, content,
    } = useCasePayload;
    this._validateAddCommentsUseCasePayload({
      userId, username, threadId, content,
    });
    await this._userRepository.getIdByUsername(username);
    await this._threadsRepository.validateThreadExist(threadId);
    const addComment = new AddComments(useCasePayload);
    const queryResult = await this._threadsRepository.addComments(addComment);
    const { id: commentId } = queryResult;
    await this._threadsRepository.addThreadsComments({ threadId, commentId });
    return queryResult;
  }

  async getThreadDetailById(useCasePayload) {
    const {
      id,
    } = useCasePayload;

    this._validateGetThreadDetailByIdUseCasePayload(id);
    const thread = await this._threadsRepository.getThreadDetailById(id);
    const threadComments = await this._threadsRepository.getThreadDetailCommentsByThreadId(id);

    const sortCommentsByDate = threadComments
      .map(mapDBThreadDetailToModel)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const checkDeletedComments = sortCommentsByDate.map((item) => {
      if (item.isDeleted) {
        item.content = '**komentar telah dihapus**';
        delete item.isDeleted;
        return item;
      }
      delete item.isDeleted;
      return item;
    });

    return { thread, comments: checkDeletedComments };
  }

  async deleteCommentOnThreadByCommentId(useCasePayload) {
    const {
      userId: owner, threadId, commentId,
    } = useCasePayload;

    this._validateDeleteCommentOnThreadByCommentIdPayload({ owner, threadId, commentId });
    await this._threadsRepository.validateThreadExist(threadId);
    await this._threadsRepository.validateCommentExist(commentId);
    const comment = await this._threadsRepository.getCommentOwnerByCommentId(commentId);

    // translate di domain error
    if (comment.owner !== owner) {
      throw new Error('DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID.NOT_OWNER_OF_THE_COMMENT');
    }

    await this._threadsRepository.sofDeleteComment(commentId);
  }

  _validateAddThreadsUseCasePayload({
    title, body, userId, username,
  }) {
    if (!title || !body || !userId || !username) {
      throw new Error('ADD_THREAD_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof userId !== 'string' || typeof username !== 'string') {
      throw new Error('ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _validateAddCommentsUseCasePayload({
    userId, username, threadId, content,
  }) {
    if (!userId || !username || !threadId || !content) {
      throw new Error('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string' || typeof username !== 'string' || typeof threadId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _validateGetThreadDetailByIdUseCasePayload(id) {
    if (!id) {
      throw new Error('GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string') {
      throw new Error('GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _validateDeleteCommentOnThreadByCommentIdPayload({ owner, threadId, commentId }) {
    if (!owner || !threadId || !commentId) {
      throw new Error('DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadsUseCase;
