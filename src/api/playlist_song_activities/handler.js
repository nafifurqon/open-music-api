class PlaylistSongActivitiesHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.getPlaylistSongActivitiesHandler = this.getPlaylistSongActivitiesHandler.bind(this);
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });

    const dataPlaylistSongActivities = await this._service.getPlaylistSongActivities(playlistId);

    return {
      status: 'success',
      data: dataPlaylistSongActivities,
    };
  }
}

module.exports = PlaylistSongActivitiesHandler;
