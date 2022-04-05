const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivities {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivities({
    playlistId, songId, userId, action,
  }) {
    const id = `playlist-song-activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const createdAt = time;
    const updatedAt = time;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, playlistId, songId, userId, action, time, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan playlist aktivitas');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = 'SELECT psa.playlist_id, u.username, s.title, psa.action, psa.time from playlist_song_activities as psa '
    + 'INNER JOIN users as u ON u.id = psa.user_id '
    + 'INNER JOIN songs as s ON s.id = psa.song_id '
    + `WHERE psa.playlist_id = '${playlistId}' `
    + 'ORDER BY psa.time ASC';

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      const mappedResult = {
        playlistId: result.rows[0].playlist_id,
      };

      mappedResult.activities = result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
      }));

      return mappedResult;
    }

    return result.rows;
  }
}

module.exports = PlaylistSongActivities;
