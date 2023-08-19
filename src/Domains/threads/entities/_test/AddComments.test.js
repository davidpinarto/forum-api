const AddComments = require('../AddComments');

describe('a Comment entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      threadId: 'thread-123',
      content: 'Comment content',
    };

    // Action and Assert
    expect(() => new AddComments(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      userId: 'user-123',
      username: 'david',
      threadId: 123,
      content: 234,
    };

    // Action and Assert
    expect(() => new AddComments(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
