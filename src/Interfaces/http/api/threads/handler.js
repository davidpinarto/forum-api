const ThreadsUseCase = require('../../../../Applications/use_case/ThreadsUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailByIdHandler = this.getThreadDetailByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId, username } = request.auth.credentials;
    const { title, body } = request.payload;

    const addThreadsUseCase = this._container.getInstance(ThreadsUseCase.name);

    const addedThread = await addThreadsUseCase.addThread({
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

  async getThreadDetailByIdHandler(request, h) {
    const { threadId: id } = request.params;

    const getThreadDetailByThreadIdUseCase = this._container
      .getInstance(ThreadsUseCase.name);

    const { thread, comments } = await getThreadDetailByThreadIdUseCase.getThreadDetailById({ id });

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
}

module.exports = ThreadsHandler;
