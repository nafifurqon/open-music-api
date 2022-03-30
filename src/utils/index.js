/* eslint-disable camelcase */
const mapDBToModel = (payload) => {
  const result = {
    ...payload,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };

  delete result.created_at;
  delete result.updated_at;

  return result;
};

const mappedSongs = (row) => ({
  id: row.song_id,
  title: row.title,
  performer: row.performer,
});

module.exports = { mapDBToModel, mappedSongs };
