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

module.exports = { mapDBToModel };
