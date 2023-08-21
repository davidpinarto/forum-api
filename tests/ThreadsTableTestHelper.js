/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    owner = 'user-123',
    username = 'david',
    title = 'Thread Title',
    body = 'Thread body',
    date = '2021-08-08T07:19:09.775Z',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, owner, username, title, body, date],
    };

    await pool.query(query);
  },

  async getThreadDetailById(id) {
    const query = {
      text: 'SELECT id, title, body, date, username FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
