/* eslint-disable max-len */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsService {
  constructor(songsService, cacheService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    await this._cacheService.delete('albums');
    return result.rows[0].id;
  }

  async getAlbums() {
    try {
      const result = await this._cacheService.get('albums');

      return JSON.parse(result);
    } catch (error) {
      const result = await this._pool.query('SELECT * FROM albums');

      await this._cacheService.set(
        'albums',
        JSON.stringify(result.rows.map(mapDBToModel)),
      );

      return result.rows.map(mapDBToModel);
    }
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);

      return JSON.parse(result);
    } catch (error) {
      const songs = await this._songsService.getSongs({ albumId: id });

      const query = {
        text: 'SELECT id, name, year FROM albums WHERE id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const mappedResult = {
        ...result.rows[0],
        songs,
      };

      await this._cacheService.set(
        `album:${id}`,
        JSON.stringify(mappedResult),
      );

      return mappedResult;
    }
  }

  async existsAlbum(id) {
    const query = {
      text: 'SELECT 1 FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return false;
    }

    return true;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, '
      + 'updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    await this._cacheService.delete(`album:${id}`);
    await this._cacheService.delete('albums');
  }

  async editCoverUrlAlbumById(id, coverUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1, '
      + 'updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }

    await this._cacheService.delete(`album:${id}`);
    await this._cacheService.delete('albums');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`album:${id}`);
    await this._cacheService.delete('albums');
  }
}

module.exports = AlbumsService;
