const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumsService, cacheService) {
    this._userAlbumLikesService = userAlbumLikesService;
    this._albumsService = albumsService;
    this._cacheService = cacheService;

    this.postUserAlbumLikeHandler = this.postUserAlbumLikeHandler.bind(this);
    this.getAlbumLikeCountHandler = this.getAlbumLikeCountHandler.bind(this);
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
      message = 'Berhasil batal menyukai album';
    } else {
      await this._userAlbumLikesService.addUserAlbumLike(userId, albumId);
    }

    await this._cacheService.delete(`album-likes:${albumId}`);

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeCountHandler(request, h) {
    const { albumId } = request.params;

    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);

      const response = h.response({
        status: 'success',
        data: JSON.parse(result),
      });
      response.header('X-Data-Source', 'cache');

      return response;
    } catch (error) {
      const likes = await this._userAlbumLikesService.getCountAlbumLike(albumId);

      await this._cacheService.set(
        `album-likes:${albumId}`,
        JSON.stringify(likes),
        1800,
      );

      return {
        status: 'success',
        data: likes,
      };
    }
  }
}

module.exports = UserAlbumLikesHandler;
