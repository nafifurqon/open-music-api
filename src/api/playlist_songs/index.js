const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsService, validator, playlistSongsService, songsService,
  }) => {
    // eslint-disable-next-line max-len
    const playlistSongsHandler = new PlaylistSongsHandler(playlistsService, validator, playlistSongsService, songsService);
    server.route(routes(playlistSongsHandler));
  },
};
