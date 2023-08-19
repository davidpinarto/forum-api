const ThreadsUseCase = require('../../../../Applications/use_case/ThreadsUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailByIdHandler = this.getThreadDetailByIdHandler.bind(this);
    this.postThreadsCommentsHandler = this.postThreadsCommentsHandler.bind(this);
    this.deleteThreadsCommentsHandler = this.deleteThreadsCommentsHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId, username } = request.auth.credentials;
    const { title, body } = request.payload;

    const threadsUseCase = this._container.getInstance(ThreadsUseCase.name);

    const addedThread = await threadsUseCase.addThreads({
      userId, username, title, body,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedThread: {
          id: addedThread.id,
          title: addedThread.title,
          owner: addedThread.owner,
        },
      },
    });
    response.code(201);
    return response;
  }

  async postThreadsCommentsHandler(request, h) {
    const { id: userId, username } = request.auth.credentials;
    const { threadId } = request.params;
    const { content } = request.payload;

    const threadsUseCase = this._container.getInstance(ThreadsUseCase.name);

    const addedComment = await threadsUseCase.addComments({
      userId, username, threadId, content,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment: {
          id: addedComment.id,
          content: addedComment.content,
          owner: addedComment.owner,
        },
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailByIdHandler(request, h) {
    const { threadId: id } = request.params;

    const threadsUseCase = this._container.getInstance(ThreadsUseCase.name);

    const { thread, comments } = await threadsUseCase.getThreadDetailById({ id });

    const response = h.response({
      status: 'success',
      data: {
        thread: {
          id: thread.id,
          title: thread.title,
          body: thread.body,
          date: thread.date,
          username: thread.username,
          comments,
        },
      },
    });
    response.code(200);
    return response;
  }

  async deleteThreadsCommentsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const threadsUseCase = this._container.getInstance(ThreadsUseCase.name);

    await threadsUseCase.deleteCommentOnThreadByCommentId({
      userId, threadId, commentId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
