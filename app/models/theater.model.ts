import { model, Schema } from "mongoose";
import { TheaterInterface } from "../interface/theater.interface";
import Joi from "joi";

export const theaterValidation = Joi.object({
    theatername: Joi.string().required().min(2).max(100),
    location: Joi.string().required().min(5).max(200),
    screens: Joi.number().required().min(1).max(20)
});

export const addMovieValidation = Joi.object({
    movie: Joi.string().required().messages({
        'string.empty': 'Movie ID is required'
    }),
    screenNumber: Joi.number().required().min(1).messages({
        'number.base': 'Screen number must be a number',
        'number.min': 'Screen number must be at least 1'
    }),
    showTimings: Joi.array().items(Joi.string()).required().min(1).messages({
        'array.min': 'At least one show timing is required'
    })
});

const theaterSchema = new Schema<TheaterInterface>(
    {
        theatername: { type: String, required: true },
        location: { type: String, required: true },
        screens: { type: Number, required: true },
        movies: [
            {
                movie: { type: Schema.Types.ObjectId, ref: "Movie" },
                screenNumber: { type: Number },
                showTimings: [{ type: String }],
            },
        ],
    },
    { timestamps: true }
);

theaterSchema.index({ location: 1 });
theaterSchema.index({ 'movies.movie': 1 });

const theaterModel = model<TheaterInterface>("Theater", theaterSchema);

export { theaterModel }