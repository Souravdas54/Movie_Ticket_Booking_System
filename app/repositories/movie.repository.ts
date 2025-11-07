import { movieModel } from "../models/movie.model";
import { MovieInterface } from "../interface/movie.interface";

class MovieRepository {

    async create(data: Partial<MovieInterface>) {
        try {
            const movie = new movieModel(data);
            const savedMovie = await movie.save();
            return savedMovie;
        } catch (error) {
            console.error("Error creating movie:", error);
            throw error;
        }
    }

    async findAll() {
        try {
            const getAllMovies = await movieModel.find();
            return getAllMovies;
        } catch (error) {
             console.error("Error fetching movies:", error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const MoviefindById = await movieModel.findById(id);
            return MoviefindById;
        } catch (error) {
            console.error("Error fetching movies:", error);
            throw error;
        }
    }

     async update(id: string, data: Partial<MovieInterface>) {
        try {
            const updatedMovie = await movieModel.findByIdAndUpdate(id, data, { new: true });
            return updatedMovie;
        } catch (error) {
            console.error("Error updating movie:", error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            const deletedMovie = await movieModel.findByIdAndDelete(id);
            return deletedMovie;
        } catch (error) {
            console.error("Error deleting movie:", error);
            throw error;
        }
    }
};

const movieRepository = new MovieRepository()

export { movieRepository }