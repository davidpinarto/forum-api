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
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailByIdHandler(request, h) {
    const { threadId: id } = request.params;

    const getThreadDetailByThreadIdUseCase = this._container
      .getInstance(ThreadsUseCase.name);

    const thread = await getThreadDetailByThreadIdUseCase.getThreadDetailById({ id });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
