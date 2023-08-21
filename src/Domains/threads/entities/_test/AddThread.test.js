const AddThread = require('../AddThread');

describe('a Thread entitites', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'thread title',
      userId: 'user-123',
      username: 'david',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      body: 'thread body',
      userId: 'user-123',
      username: 'david',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return AddThread object data correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
      body: 'Thread body',
      userId: 'user-123',
      username: 'david',
    };

    // Action
    const addThread = () => new AddThread(payload);

    // Assert
    expect(addThread()).toMatchObject({
      userId: 'user-123',
      username: 'david',
      title: 'Thread Title',
      body: 'Thread body',
    });
  });
});
