class PlaylistSongActivitiesHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
  }

  async getPlaylistSongActivitiesHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner({ playlistId, credentialId });

    const dataPlaylistSongActivities = await this._service.getPlaylistSongActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: dataPlaylistSongActivities,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongActivitiesHandler;
