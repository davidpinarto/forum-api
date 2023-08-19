class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      title, body, userId, username,
    } = payload;

    this.userId = userId;
    this.username = username;
    this.title = title;
    this.body = body;
  }

  _verifyPayload({
    title, body, userId, username,
  }) {
    if (!title || !body || !userId || !username) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof userId !== 'string' || typeof username !== 'string') {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThread;
