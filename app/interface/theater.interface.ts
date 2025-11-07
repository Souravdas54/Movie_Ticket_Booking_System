import mongoose from "mongoose";


export interface TheaterInterface {
    name: string;
    location: string;
    screens: number;
    movies: {
        movie: mongoose.Types.ObjectId;
        screenNumber: number;
        showTimings: string[];
    }[];
}