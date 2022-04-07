const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{albumId}/likes',
    handler: handler.postUserAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
