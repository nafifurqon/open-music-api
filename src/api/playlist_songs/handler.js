class PlaylistSongsHandler {
  constructor(
    playlistsService,
    validator,
    playlistSongsService,
    songsService,
    playlistSongActivitiesService,
  ) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;

    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postSongToPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validatePlaylistSongsPayload({
      playlistId,
      songId,
    });

    await this._playlistsService.getPlaylistById(playlistId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.verifyPlaylistOwner({
      playlistId, owner: credentialId,
    });

    await this._playlistSongsService.addPlaylistSong({ playlistId, songId });

    await this._playlistSongActivitiesService.addPlaylistSongActivities({
      playlistId,
      songId,
      userId: credentialId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });

    const playlistSongs = await this._playlistSongsService.getPlaylistSongs({
      playlistId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlist: playlistSongs,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validatePlaylistSongsPayload({
      playlistId,
      songId,
    });

    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });

    await this._playlistSongsService.deletePlaylistSong({
      playlistId,
      songId,
    });

    await this._playlistSongActivitiesService.addPlaylistSongActivities({
      playlistId,
      songId,
      userId: credentialId,
      action: 'delete',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongsHandler;
