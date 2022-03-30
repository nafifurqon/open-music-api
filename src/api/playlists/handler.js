class PlaylistsHandler {
  constructor(playlistsService, validator, playlistSongsService, songsService) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: owner } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async postSongToPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    this._validator.validatePlaylistSongsPayload({
      playlistId, songId,
    });

    await this._playlistsService.getPlaylistById(playlistId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._playlistSongsService.addPlaylistSong({ playlistId, songId });

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

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

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
      playlistId, songId,
    });

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._playlistSongsService.deletePlaylistSong({
      playlistId, songId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });
    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._playlistsService.deletePlaylist(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
