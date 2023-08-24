const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread Title',
        body: 'Thread body',
      };

      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // create user authentication
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);

      const { accessToken } = authenticationResponseJson.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload did not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Thread Title',
      };

      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // create user authentication
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);

      const { accessToken } = authenticationResponseJson.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan thread karena properti tidak lengkap');
    });

    it('should response 400 when request payload data type not string', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: [],
      };

      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'david',
          password: 'secret',
          fullname: 'David Pinarto',
        },
      });

      // create user authentication
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'david',
          password: 'secret',
        },
      });

      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);

      const { accessToken } = authenticationResponseJson.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena type data properti tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and contain detail thread data', async () => {
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
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken3}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread detail not found', async () => {
      // Arrange
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      const threadId = 'thread-124';

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
