const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username '
      + 'FROM playlists '
      + 'LEFT JOIN users ON users.id = playlists.owner '
      + 'LEFT JOIN collaborations as c ON c.playlist_id = playlists.id '
      + 'WHERE playlists.owner = $1 OR users.id = $1 OR c.user_id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async verifyPlaylistOwner({ playlistId, owner, checkCollaborator = true }) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      if (checkCollaborator) {
        await this.verifyPlaylistCollaborator(playlistId, owner);
      } else {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }

  async verifyPlaylistCollaborator(id, collaborator) {
    const query = {
      text: 'SELECT p.*, c.user_id as collaborator FROM playlists as p '
      + 'INNER JOIN collaborations as c ON c.playlist_id = p.id '
      + 'WHERE p.id = $1 AND c.user_id = $2',
      values: [id, collaborator],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini verPlayCol');
    }
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 returning id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
