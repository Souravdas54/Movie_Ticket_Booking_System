import express from 'express';
import { movieController } from '../controllers/movie.controller';
import { protect ,authorizeRoles} from '../middleware/auth.middleaware';

const movieRouter = express.Router()

movieRouter.post('/movie/create', protect,authorizeRoles('admin'),movieController.movie_create)
movieRouter.get('/get/movies',protect,authorizeRoles('admin'),movieController.getAllMovies)
movieRouter.put('/update/movie/:id',protect, authorizeRoles('admin'),movieController.update_movie)
movieRouter.delete('/delete/movie/:id',protect,authorizeRoles('admin'),movieController.delete_movie)

movieRouter.get('/get/movies/:id',protect,authorizeRoles('admin','user'),movieController.movieGetById)

export {movieRouter};