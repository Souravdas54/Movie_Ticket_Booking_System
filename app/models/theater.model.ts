import { model, Schema } from "mongoose";
import { TheaterInterface } from "../interface/theater.interface";

const theaterSchema = new Schema<TheaterInterface>(
    {
        name: { type: String, required: true },
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

const theaterModel = model<TheaterInterface>("Theater", theaterSchema);

export { theaterModel }