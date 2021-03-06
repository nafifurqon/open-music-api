const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().min(1).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = AlbumPayloadSchema;
