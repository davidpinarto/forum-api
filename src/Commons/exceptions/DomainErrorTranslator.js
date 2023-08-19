const InvariantError = require('./InvariantError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan thread karena properti tidak lengkap'),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread karena type data properti tidak sesuai'),
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan komentar karena properti tidak lengkap'),
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapata membuat komentar karena type data properti tidak sesuai'),
  'ADD_THREAD_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menambahkan thread karena properti tidak lengkap'),
  'ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat thread karena type data properti tidak sesuai'),
  'GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat mendapatkan detail thread karena properti tidak lengkap'),
  'GET_THREAD_BY_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('type data id harus string'),
  'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Gagal menambahkan komentar karena body request tidak lengkap'),
  'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Gagal menambahkan komentar karena type data tidak sesuai'),
  'DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('Gagal menghapus komentar karena properti tidak lengkap'),
  'DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('Gagal menghapus komentar karena type data properti tidak sesuai'),
  'DELETE_COMMENT_ON_THREAD_BY_COMMENT_ID.NOT_OWNER_OF_THE_COMMENT': new AuthorizationError('Anda tidak berhak menghapus comment'),
};

module.exports = DomainErrorTranslator;
