import { Request, Response } from "express";
import { movieValidation } from "../models/movie.model"
import { movieRepository } from "../repositories/movie.repository";
import _ from 'lodash';

class MovieController {

    async movie_create(req: Request, res: Response): Promise<any> {
        try {
            console.log('🎬 Creating movie with data:', req.body);

            const { error, value } = movieValidation.validate(req.body);

            if (error) {
                return res.status(400).json({ message: error.message });
            }


            const createnewmovie = await movieRepository.create(value)
            console.log('✅ Movie created:', createnewmovie);

            const formattedMovie = {
                ...createnewmovie.toObject(),
                releaseDate: new Date(createnewmovie.releaseDate).toISOString().split('T')[0]
            };

            if (_.isObject(createnewmovie) && createnewmovie._id) {
                return res.status(200).send({
                    message: "Movie created successfully",
                    data: formattedMovie,
                });
            } else {
                return res.status(400).send({
                    message: "Failed to create movie",
                });
            }
        } catch (error) {
            console.error("Error creating movie:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async getAllMovies(req: Request, res: Response): Promise<any> {
        try {
            const moviegetall = await movieRepository.findAll()

            const formattedMovies = moviegetall.map(movie => ({
                ...movie.toObject(),
                releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0]
            }));

            res.status(200).json({
                success: true,
                message: "Movies retrieved successfully",
                total: formattedMovies.length,
                data: formattedMovies,
            });

        } catch (error) {
            console.error("Error get all movies:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async movieGetById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const movie = await movieRepository.findById(id)

            if (!movie) {
                return res.status(404).json({ message: "User not found" });
            }

            const formattedMovie = {
                ...movie.toObject(),
                releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0]
            };

            return res.status(200).json({
                message: "Movie retrieved successfully",
                data: formattedMovie,
                // data: _.omit(formattedMovie.toObject()),
            });
        } catch (error) {
            console.error("Error get by id movie:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async update_movie(req: Request, res: Response): Promise<any> {

        try {
            const { id } = req.params;
            console.log('🔄 Updating movie:', id, 'with data:', req.body);

            const { error, value } = movieValidation.validate(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
                return;
            }

            const updatedMovie = await movieRepository.update(id, value);

            if (!updatedMovie) {
                res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
                return;
            }

            // Format the date
            const formattedMovie = {
                ...updatedMovie.toObject(),
                releaseDate: new Date(updatedMovie.releaseDate).toISOString().split('T')[0]
            };

            res.status(200).json({
                success: true,
                message: "Movie updated successfully",
                data: formattedMovie,
            });
        } catch (error) {
            console.error("Error not update movie:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async delete_movie(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            console.log('Deleting movie:', id);

            const deletedMovie = await movieRepository.delete(id);

            if (!deletedMovie) {
                res.status(404).json({ 
                    success: false,
                    message: "Movie not found" 
                });
                return;
            }

            const formattedMovie = {
                ...deletedMovie.toObject(),
                releaseDate: new Date(deletedMovie.releaseDate).toISOString().split('T')[0]
            };

            res.status(200).json({
                success: true,
                message: "Movie deleted successfully",
                data: formattedMovie,
            });

        } catch (error: any) {
            console.error("Error deleting movie:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
}
const movieController = new MovieController()
export { movieController }