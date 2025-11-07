import { model, Schema } from 'mongoose';
import { MovieInterface } from '../interface/movie.interface';
import Joi from 'joi'

export const movieValidation = Joi.object({
    moviename: Joi.string().required(),
    genre: Joi.string().required(),
    language: Joi.string().required(),
    duration: Joi.string().required(),
    cast: Joi.array().items(Joi.string()).required(),
    director: Joi.string().required(),
    releaseDate: Joi.string().required()
})
const MovieSchema = new Schema<MovieInterface>(
    {
        moviename: { type: String, required: true },
        genre: { type: String, required: true },
        language: { type: String, required: true },
        duration: { type: String, required: true },
        cast: [{ type: String, required: true }],
        director: { type: String, required: true },
        releaseDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const movieModel = model<MovieInterface>("Movie", MovieSchema);

export { movieModel }