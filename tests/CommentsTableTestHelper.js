/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComments({
    id = 'comment-123',
    owner = 'user-234',
    username = 'shibainu',
    content = 'Comment content',
    date = '2021-08-08T07:19:09.775Z',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, owner, username, content, date],
    };

    await pool.query(query);
  },

  async addThreadsComments({ id, threadId, commentId }) {
    const query = {
      text: 'INSERT INTO threads_comments VALUES($1, $2, $3)',
      values: [id, threadId, commentId],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
    await pool.query('DELETE FROM threads_comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
