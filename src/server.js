require('dotenv').config();

const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService(songsService);
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const errorResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      errorResponse.code(response.statusCode);
      return errorResponse;
    }

    if (response instanceof ReferenceError) {
      const errorResponse = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      errorResponse.code(500);
      return errorResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.warn(`Server berjalan pada ${server.info.uri}`);
};

init();
