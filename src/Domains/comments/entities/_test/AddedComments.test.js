const AddedComments = require('../AddedComments');

describe('a Comment entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment content',
    };

    // Action and Assert
    expect(() => new AddedComments({ ...payload })).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'Comment content',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedComments({ ...payload })).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return AddedComment object data correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment content',
      owner: 'user-123',
    };

    // Action
    const addedComments = () => new AddedComments(payload);

    // Assert
    expect(addedComments()).toMatchObject({
      id: 'comment-123',
      content: 'Comment content',
      owner: 'user-123',
    });
  });
});
