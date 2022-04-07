const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumsService) {
    this._userAlbumLikesService = userAlbumLikesService;
    this._albumsService = albumsService;

    this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    const existsAlbum = await this._albumsService.existsAlbum(albumId);
    if (!existsAlbum) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const existsUserAlbumLike
      = await this._userAlbumLikesService.existsUserAlbumLike(userId, albumId);

    let message = 'Berhasil menyukai album';

    if (existsUserAlbumLike) {
      await this._userAlbumLikesService.deleteUserAlbumLike(userId, albumId);
      message = 'Berhasil tidak menyukai album';
    } else {
      await this._userAlbumLikesService.addUserAlbumLike(userId, albumId);
    }

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
