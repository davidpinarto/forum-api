const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadsRepository = require('../../Domains/threads/ThreadsRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadsRepositoryPostgres extends ThreadsRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(threadPayload) {
    const {
      userId: owner, username, title, body,
    } = threadPayload;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, owner, username, title, body, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadDetailById(id) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, threads.username 
        FROM threads
        WHERE threads.id = $1  
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return { ...result.rows[0] };
  }

  async validateThreadExist(id) {
    const query = {
      text: `
        SELECT threads.id
        FROM threads
        WHERE threads.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}

module.exports = ThreadsRepositoryPostgres;
