const AddComments = require('../../Domains/comments/entities/AddComments');

class CommentsUseCase {
  constructor({ threadsRepository, commentsRepository }) {
    this._threadsRepository = threadsRepository;
    this._commentsRepository = commentsRepository;
  }

  async addComment(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadsRepository.validateThreadExist(threadId);
    const addComment = new AddComments(useCasePayload);
    const addedComment = await this._commentsRepository.addComments(addComment);
    const { id: commentId } = addedComment;
    await this._commentsRepository.addThreadsComments({ threadId, commentId });
    return addedComment;
  }

  async deleteComment(useCasePayload) {
    const { userId, threadId, commentId } = useCasePayload;
    await this._threadsRepository.validateThreadExist(threadId);
    await this._commentsRepository.validateCommentExist(commentId);
    await this._commentsRepository.validateCommentOwner({ commentId, userId });
    await this._commentsRepository.sofDeleteComment(commentId);
  }
}

module.exports = CommentsUseCase;
