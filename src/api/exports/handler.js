const NotFoundError = require('../../exceptions/NotFoundError');

class ExportsHandler {
  constructor(playlistsService, service, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const existPlaylist = await this._playlistsService.checkExistsPlaylist(playlistId);

    if (!existPlaylist) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    await this._playlistsService.verifyPlaylistOwner({
      playlistId,
      owner: credentialId,
    });

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._service.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
