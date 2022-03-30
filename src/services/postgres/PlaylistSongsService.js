const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
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
    + `WHERE p.id = '${playlistId}' and p.owner = '${owner}'`;

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      const mappedResult = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        username: result.rows[0].username,
      };

      mappedResult.songs = result.rows.map(mappedSongs);

      return mappedResult;
    }

    return result.rows;
  }
}

module.exports = PlaylistSongsService;
