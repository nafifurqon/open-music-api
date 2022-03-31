const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistsService,
      validator,
      playlistSongsService,
      songsService,
      playlistSongActivitiesService,
    },
  ) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistsService,
      validator,
      playlistSongsService,
      songsService,
      playlistSongActivitiesService,
    );
    server.route(routes(playlistSongsHandler));
  },
};
