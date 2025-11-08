import { theaterModel } from "../models/theater.model";
import { TheaterInterface } from "../interface/theater.interface";
import mongoose from "mongoose";

class TheaterRepository {

    // Create theater
    async create(data: Partial<TheaterInterface>) {
        try {
            const theater = new theaterModel(data)
            const saveTheater = await theater.save();
            return saveTheater;
        } catch (error) {
            console.error("Error creating movie:", error);
            throw error;
        }
    }

    // Get all theater
    async findAll() {
        try {
            const theaters = await theaterModel.find().populate("movies.movie");
            return theaters;
        } catch (error) {
            console.error("❌ Error fetching theaters:", error);
            throw error;
        }
    }

    // Get theater by ID
    async findById(id: string) {
        try {
            const theater = await theaterModel.findById(id).populate("movies.movie");
            return theater;
        } catch (error) {
            console.error("Error fetching theater by ID:", error);
            throw error;
        }
    }

    // Update theater details
    async update(id: string, data: Partial<TheaterInterface>) {
        try {
            const updatedTheater = await theaterModel.findByIdAndUpdate(id, data, { new: true });
            return updatedTheater;
        } catch (error) {
            console.error("Error updating theater:", error);
            throw error;
        }
    }

    //Delete a theater
    async delete(id: string) {
        try {
            const deletedTheater = await theaterModel.findByIdAndDelete(id);
            return deletedTheater;
        } catch (error) {
            console.error("Error deleting theater:", error);
            throw error;
        }
    }

    async assign_movie_to_theather(theaterId: string, movieId: string, screenNumber: number, showTimings: string[]) {
        try {
            const theater = await theaterModel.findById(theaterId)
            console.log("Theater get by ID ", theater);
            if (!theater) {
                throw new Error("Theater not found")
            }

            const existingScreen = theater.movies.find((f) => f.screenNumber === screenNumber)
            if (existingScreen) {
                throw new Error(`Screen ${screenNumber} already assigned to another movie`)
            }

            theater.movies.push({
                movie: new mongoose.Types.ObjectId(movieId),
                screenNumber,
                showTimings,
            })

            return await theater.save()

        } catch (error) {
            console.error("Error assigning movie to theater:", error);
            throw error;
        }
    }

    // Get movies with theater details
    async get_movie_theater_details() {

        try {
            const result = await theaterModel.aggregate([
                { $unwind: "$movies" },
                {
                    $lookup: {
                        from: 'movies',
                        localField: 'movies.movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                },
                {
                    $unwind: '$movieDetails'
                },

                { $sort: { "movie.moviename": 1 } },
                {
                    $project: {
                        _id: 0,
                        moviename: "$movieDetails.moviename",
                        genre: "$movieDetails.genre",
                        language: "$movieDetails.language",
                        duration: "$movieDetails.duration",
                        cast: "$movieDetails.cast",
                        director: "$movieDetails.director",
                        theatername: "$theatername",
                        location: "$location",
                        screens: "$screens",
                        screenNumber: "$movies.screenNumber",
                        showTimings: "$movies.showTimings",

                    }
                }
            ])
            return result;
        } catch (error) {
            console.error("Error fetching movies with theater details:", error);
            throw error;
        }
    }
}

const theaterRepository = new TheaterRepository()
export { theaterRepository }