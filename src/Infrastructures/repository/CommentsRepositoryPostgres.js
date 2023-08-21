const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentsRepository = require('../../Domains/comments/CommentsRepository');
const AddedComments = require('../../Domains/comments/entities/AddedComments');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentsRepositoryPostgres extends CommentsRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComments(commentsPayload) {
    const {
      userId: owner, username, content,
    } = commentsPayload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, username, content, date],
    };

    const result = await this._pool.query(query);

    return new AddedComments({ ...result.rows[0] });
  }

  async addThreadsComments({ threadId, commentId }) {
    const id = `thread_comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads_comments VALUES($1, $2, $3) RETURNING id',
      values: [id, threadId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getThreadDetailCommentsByThreadId(id) {
    const query = {
      text: `
          SELECT comments.id, comments.username, comments.date, comments.content, comments.is_deleted
          FROM threads_comments
          INNER JOIN comments ON threads_comments.comment_id = comments.id
          WHERE threads_comments.thread_id = $1 
        `,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async validateCommentExist(id) {
    const query = {
      text: `
        SELECT comments.id
        FROM comments
        WHERE comments.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async validateCommentOwner({ commentId, userId }) {
    const query = {
      text: `
        SELECT comments.owner
        FROM comments
        WHERE comments.id = $1
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak menghapus comment');
    }
  }

  async sofDeleteComment(id) {
    const query = {
      text: `
        UPDATE comments
        SET is_deleted = true
        WHERE id = $1
        RETURNING id
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus comment');
    }

    return result.rows[0].id;
  }
}

module.exports = CommentsRepositoryPostgres;
