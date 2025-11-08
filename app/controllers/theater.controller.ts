import { Request, Response } from "express";
import { theaterRepository } from "../repositories/theater.repository";
import { theaterValidation, addMovieValidation } from "../models/theater.model";

class TheaterController {

    async create_theater(req: Request, res: Response) {

        try {
            const { error, value } = theaterValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.message });
            }

            const createTheater = await theaterRepository.create(value)
            console.log('Theater created successfully');

            res.status(201).json({
                success: true,
                message: "Theater created successfully",
                data: createTheater,
            });
        } catch (error) {
            console.error("Error creating theater:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                // error: error.message
            });
        }

    }

    async getAllTheaters(req: Request, res: Response): Promise<any> {
        try {
            const theaters = await theaterRepository.findAll();

            return res.status(200).json({
                message: "All theaters fetched successfully",
                total: theaters.length,
                data: theaters,
            });
        } catch (error) {
            console.error("Error fetching theaters:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async getTheaterById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const theater = await theaterRepository.findById(id);

            if (!theater) {
                return res.status(404).json({ message: "Theater not found" });
            }

            return res.status(200).json({
                message: "Theater fetched successfully",
                data: theater,
            });
        } catch (error) {
            console.error("Error fetching theater by ID:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    // Update theater
    async updateTheater(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedTheater = await theaterRepository.update(id, updateData);

            if (!updatedTheater) {
                return res.status(404).json({ message: "Theater not found" });
            }

            return res.status(200).json({
                message: "Theater updated successfully",
                data: updatedTheater,
            });
        } catch (error) {
            console.error("Error updating theater:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    // Delete theater
    async deleteTheater(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const deletedTheater = await theaterRepository.delete(id);

            if (!deletedTheater) {
                return res.status(404).json({ message: "Theater not found" });
            }

            return res.status(200).json({
                message: "Theater deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting theater:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    async assignmovie(req: Request, res: Response): Promise<any> {
        try {
            const { theaterId, movieId, screenNumber, showTimings } = req.body;
            if (!theaterId || !movieId || !screenNumber || !showTimings) {
                return res.status(400).json({
                    message: "All fields required: theaterId, movieId, screenNumber, showTimings",
                })
            }

            const assignedTheater = await theaterRepository.assign_movie_to_theather(
                theaterId, movieId, screenNumber, showTimings
            );

            return res.status(200).json({
                success: true,
                message: "Movie assigned to theater to successfully",
                data: assignedTheater
            })
        } catch (error) {
            console.error("Error assigning movie:", error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }

    // Get Movies With Theater Info
    async get_Movie_With_Theater(req: Request, res: Response): Promise<any> {
        try {
            const theaterWithMovie = await theaterRepository.get_movie_theater_details();

            return res.status(200).json({
                message: "Movies with theater details fetched successfully",
                totalMovies: theaterWithMovie.length,
                data: theaterWithMovie,
            });
        } catch (error) {
            console.error("Error fetching movies with theaters:", error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error instanceof Error ? error.message : error,
            });
        }


    }
}
const theaterController = new TheaterController()
export { theaterController }