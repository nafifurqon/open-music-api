const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, validator, playlistSongsService, songsService,
  }) => {
    // eslint-disable-next-line max-len
    const playlistsHandler = new PlaylistsHandler(playlistsService, validator, playlistSongsService, songsService);
    server.route(routes(playlistsHandler));
  },
};
