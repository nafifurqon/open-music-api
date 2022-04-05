const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mappedSongs } = require('../../utils');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong({ playlistId, songId }) {
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

  async getPlaylistSongs({ playlistId, owner }) {
    const query = 'SELECT p.id, p.name, u.username, s.id as song_id, s.title, s.performer FROM playlists as p '
    + 'INNER JOIN users as u ON u.id = p.owner '
    + 'INNER JOIN playlist_songs as ps ON ps.playlist_id = p.id '
    + 'INNER JOIN songs as s ON s.id = ps.song_id '
    + 'LEFT JOIN collaborations as c ON c.playlist_id = p.id '
    + `WHERE p.id = '${playlistId}' and (p.owner = '${owner}' OR c.user_id = '${owner}')`;

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist lagu tidak ditemukan');
    }

    const mappedResult = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
    };

    mappedResult.songs = result.rows.map(mappedSongs);

    return mappedResult;
  }

  async deletePlaylistSong({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 and song_id = $2 returning id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
