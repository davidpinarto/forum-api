const CommentsUseCase = require('../../../../Applications/use_case/CommentsUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsCommentsHandler = this.postThreadsCommentsHandler.bind(this);
    this.deleteThreadsCommentsHandler = this.deleteThreadsCommentsHandler.bind(this);
  }

  async postThreadsCommentsHandler(request, h) {
    const { id: userId, username } = request.auth.credentials;
    const { threadId } = request.params;
    const { content } = request.payload;

    const addCommentsUseCase = this._container.getInstance(CommentsUseCase.name);

    const addedComment = await addCommentsUseCase.addComment({
      userId, username, threadId, content,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadsCommentsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const deleteCommentsUseCase = this._container.getInstance(CommentsUseCase.name);

    await deleteCommentsUseCase.deleteComment({
      userId, threadId, commentId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
