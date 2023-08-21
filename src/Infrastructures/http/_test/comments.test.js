const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and contain comment data', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      const commentPayload = {
        content: 'Comment content',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond 404 when adding a comment on a non-existent thread', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // create user authentication 1
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;

      const commentPayload = {
        content: 'Comment content',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should respond 400 when adding a comment without string data type', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      const commentPayload = {
        content: 123,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal menambahkan komentar karena type data tidak sesuai');
    });

    it('should respond 400 when adding a comment with invalid body request', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      const commentPayload = {};

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Gagal menambahkan komentar karena body request tidak lengkap');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // add user 3
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'jonggun',
          password: 'secret',
          fullname: 'Jonggun',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // create user authentication 3
      const authenticationResponse3 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'jonggun',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // get access token 2
      const authenticationResponseJson3 = JSON.parse(authenticationResponse3.payload);
      const { accessToken: accessToken3 } = authenticationResponseJson3.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      // user 2 comment
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // user 3 comment
      const commentUser3Response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken3}`,
        },
      });

      // get commentId
      const commentUser3ResponseJson = JSON.parse(commentUser3Response.payload);
      const { id: user3CommentId } = commentUser3ResponseJson.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${user3CommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken3}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respond 403 if not owner of comment', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // add user 3
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'jonggun',
          password: 'secret',
          fullname: 'Jonggun',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // create user authentication 3
      const authenticationResponse3 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'jonggun',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // get access token 2
      const authenticationResponseJson3 = JSON.parse(authenticationResponse3.payload);
      const { accessToken: accessToken3 } = authenticationResponseJson3.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      // user 2 comment
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // user 3 comment
      const commentUser3Response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken3}`,
        },
      });

      // get commentId
      const commentUser3ResponseJson = JSON.parse(commentUser3Response.payload);
      const { id: user3CommentId } = commentUser3ResponseJson.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${user3CommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak menghapus comment');
    });

    it('should respond 404 when comment is not valid', async () => {
      // Arrange
      const server = await createServer(container);

      // add user 1
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // add user 2
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'gimyung',
          password: 'secret',
          fullname: 'Kim Gimyung',
        },
      });

      // create user authentication 1
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      // create user authentication 2
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'gimyung',
          password: 'secret',
        },
      });

      // get access token 1
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;

      // get access token 2
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;

      // create threads
      const threadsResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Thread Title',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // get threadId
      const threadsResponseJson = JSON.parse(threadsResponse.payload);
      const { id: threadId } = threadsResponseJson.data.addedThread;

      const invalidCommentId = 'comment-123';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${invalidCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });
  });
});
