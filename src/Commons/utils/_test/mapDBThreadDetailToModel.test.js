const { mapDBThreadDetailToModel } = require('../mapDBThreadDetailToModel');

describe('mapDBThreadDetailToModel function', () => {
  it('should return thread detail data with right data object model', () => {
    // Arrange

    const threadComments = [
      {
        id: 'comment-123',
        username: 'david',
        date: new Date().toISOString(),
        content: 'Comment content',
        is_deleted: false,
      },
    ];

    // Action
    const mappedThreadComments = threadComments.map(mapDBThreadDetailToModel);

    // Assert
    expect(mappedThreadComments).toEqual([
      {
        id: threadComments[0].id,
        username: threadComments[0].username,
        date: threadComments[0].date,
        content: threadComments[0].content,
        isDeleted: threadComments[0].is_deleted,
      },
    ]);
  });
});
