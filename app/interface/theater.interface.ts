import mongoose from "mongoose";


export interface TheaterInterface {
    theatername: string;
    location: string;
    screens: number;
    movies: {
        movie: mongoose.Types.ObjectId;
        screenNumber: number;
        showTimings: string[];
    }[];
}