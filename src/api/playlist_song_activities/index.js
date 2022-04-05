const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongActivites',
  version: '1.0.0',
  register: async (server, {
    service, validator, playlistsService,
  }) => {
    const playlistSongActivitiesHandler
      = new PlaylistSongActivitiesHandler(service, validator, playlistsService);
    server.route(routes(playlistSongActivitiesHandler));
  },
};
