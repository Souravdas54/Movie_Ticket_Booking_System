import express from "express";
import { authorizeRoles, protect } from "../middleware/auth.middleaware";
import { theaterController } from "../controllers/theater.controller";

const theaterRouter = express.Router();

theaterRouter.post('/create/theater', protect, authorizeRoles('admin'), theaterController.create_theater);
theaterRouter.get('/get/all/theater', protect, authorizeRoles('admin'), theaterController.getAllTheaters)
theaterRouter.get('/get/theater/:id', protect, authorizeRoles('admin'), theaterController.getTheaterById)
theaterRouter.put('/theater/update/:id', protect, authorizeRoles('admin'), theaterController.updateTheater)
theaterRouter.delete('/theater/delete', protect, authorizeRoles('admin'), theaterController.deleteTheater)

// Movie and Theater
theaterRouter.post('/theater/assign-movie', protect, authorizeRoles('admin'), theaterController.assignmovie)
theaterRouter.get('/theater/movie/details', protect, authorizeRoles('admin', 'user'), theaterController.get_Movie_With_Theater)

export { theaterRouter }
