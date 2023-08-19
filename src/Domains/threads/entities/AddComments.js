class AddComments {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      userId, username, threadId, content,
    } = payload;

    this.userId = userId;
    this.username = username;
    this.threadId = threadId;
    this.content = content;
  }

  _verifyPayload({
    userId, username, threadId, content,
  }) {
    if (!userId || !username || !threadId || !content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof userId !== 'string' || typeof username !== 'string' || typeof threadId !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComments;
