const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();

    // this._playlistsService = playlistsService;
    // this._songsService = songsService;
  }

  async addPlaylistSong({ playlistId, songId }) {
    // await this._playlistsService.getPlaylistById(playlistId);
    // await this._songsService.getSongById(songId);

    const id = `playlist-song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistSongsService;
