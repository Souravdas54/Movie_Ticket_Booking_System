import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDb } from './app/config/dbConnect';

import { createDefaultRoles } from './app/middleware/role.middleware';

import { router } from './app/router/user.routes';
import { movieRouter } from './app/router/movie.routes';
import { theaterRouter } from './app/router/theater.routes';
import { bookingRouter } from './app/router/booking.routes';

const app = express();
const PORT = process.env.PORT || 8500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(createDefaultRoles);

app.use(router)
app.use(movieRouter)
app.use(theaterRouter)
app.use(bookingRouter)


connectDb.then(() => {
    app.listen(process.env.PORT, () => console.log(`Server is listening on port http://localhost:${process.env.PORT}`))
});
