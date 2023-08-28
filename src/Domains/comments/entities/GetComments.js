class GetComments {
  constructor(payload) {
    const mappedComment = this._mapDBThreadDetailToModel(payload);
    const sortedCommentsByDate = this._sortCommentsByDate(mappedComment);
    this.comments = this._checkDeletedComment(sortedCommentsByDate);
  }

  _mapDBThreadDetailToModel(payload) {
    return payload.map(({
      id,
      username,
      date,
      content,
      is_deleted,
    }) => ({
      id,
      username,
      date,
      content,
      isDeleted: is_deleted,
    }));
  }

  _sortCommentsByDate(mappedComment) {
    return mappedComment.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  _checkDeletedComment(comments) {
    return comments.map((comment) => {
      if (comment.isDeleted) {
        comment.content = '**komentar telah dihapus**';
        delete comment.isDeleted;
        return comment;
      }
      delete comment.isDeleted;
      return comment;
    });
  }
}

module.exports = GetComments;
