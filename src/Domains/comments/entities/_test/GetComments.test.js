const GetComments = require('../GetComments');

describe('a GetComments entities', () => {
  it('should return comment object correctly', () => {
    // Arrange
    const date = new Date().toISOString();
    const payload = [
      {
        id: 'comment-123',
        username: 'david',
        date,
        content: 'Comment content',
        is_deleted: false,
      },
      {
        id: 'comment-234',
        username: 'shibainu',
        date,
        content: 'Comment content',
        is_deleted: true,
      },
    ];

    // Action
    const getComments = new GetComments(payload);

    // Assert
    expect(getComments).toMatchObject({
      comments:
        [
          {
            id: 'comment-123',
            username: 'david',
            date,
            content: 'Comment content',
          },
          {
            id: 'comment-234',
            username: 'shibainu',
            date,
            content: '**komentar telah dihapus**',
          },
        ],
    });
  });
});
