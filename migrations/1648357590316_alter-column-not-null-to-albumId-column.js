/* eslint-disable camelcase */

exports.shorthands = undefined;

const now = new Date().toISOString();

exports.up = (pgm) => {
  pgm.sql(
    'INSERT INTO albums(id, name, year, created_at, updated_at) '
    + `VALUES ('old_albums', 'old_albums', 2022, '${now}', '${now}')`,
  );

  pgm.sql('UPDATE songs SET "albumId" = \'old_albums\' WHERE "albumId" is NULL');

  pgm.alterColumn('songs', 'albumId', {
    notNull: true,
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('songs', 'albumId', {
    notNull: false,
  });

  pgm.sql('UPDATE songs SET "albumId" = NULL WHERE "albumId" = \'old_albums\'');

  pgm.sql(
    'INSERT INTO albums(id, name, year, created_at, updated_at) '
    + `VALUES ('old_albums', 'old_albums', 2022, ${now}, ${now})`,
  );
};
