import { Request, Response } from "express";
import { bookingRepository } from "../repositories/booking.repository";
import { BookingInterface } from "../interface/booking.interface";
import { userModel } from "../models/user.Model";
import { movieModel } from "../models/movie.model";
import { theaterModel } from "../models/theater.model";
import { bookingModel } from "../models/booking.model";
import mongoose from "mongoose";

class BookingController {

    async bookingTicket(req: Request, res: Response): Promise<any> {
        try {
            const { user, movie, theater, showTime, numberOfTickets, totalAmount } = req.body;

            if (!user || !movie || !theater || !showTime || !numberOfTickets || !totalAmount) {
                res.status(400).json({
                    message: "All fields are required"
                })
            }

            const [findUser, findMovie, findTheater] = await Promise.all([
                userModel.findById(user),
                movieModel.findById(movie),
                theaterModel.findById(theater)
            ]);

            if (!findUser || !findMovie || !findTheater) {
                return res.status(404).json({ message: "User, Movie, or Theater not found" });
            }

            const booking = await bookingRepository.createBooking({
                user,
                movie,
                theater,
                showTime,
                numberOfTickets,
                totalAmount,
                status: "Booked",
            });


            return res.status(201).json({
                message: "Tickets booked successfully",
                data: booking,
            });


        } catch (error) {
            console.error("Error booking tickets:", error);
            return res.status(500).json({ message: "Internal Server Error" });

        }
    }

    // View Booking History For - User 
    async viewBookingHistory(req: Request, res: Response) {
        try {
            const userId = req.params.userId;

            const bookings = await bookingModel.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movie",
                    },
                },
                { $unwind: "$movie" },
                {
                    $lookup: {
                        from: "theaters",
                        localField: "theater",
                        foreignField: "_id",
                        as: "theater",
                    },
                },
                { $unwind: "$theater" },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: 1,
                        showTime: 1,
                        numberOfTickets: 1,
                        totalAmount: 1,
                        status: 1,
                        "movie.moviename": 1,
                        "movie.genre": 1,
                        "movie.language": 1,
                        "theater.theatername": 1,
                        "theater.location": 1,
                        "user.name": 1,
                        "user.email": 1,
                    },
                },
            ]);

            res.status(200).json({
                message: "User booking history fetched successfully",
                totalBookings: bookings.length,
                data: bookings,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // Cancel Booking
    async cancelBooking(req: Request, res: Response) {
        try {
            const { bookingId } = req.params;

            const booking = await bookingRepository.cancleBooking(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            // booking.status = "Cancelled";
            // await booking.save();

            res.status(200).json({
                message: "Booking cancelled successfully",
                data: booking,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // Admin: View All Bookings (with user, movie, theater details)
    async getAllBookings(req: Request, res: Response) {
        try {
            const allBookings = await bookingModel.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movie",
                    },
                },
                { $unwind: "$movie" },
                {
                    $lookup: {
                        from: "theaters",
                        localField: "theater",
                        foreignField: "_id",
                        as: "theater",
                    },
                },
                { $unwind: "$theater" },
                {
                    $project: {
                        _id: 1,
                        showTime: 1,
                        numberOfTickets: 1,
                        totalAmount: 1,
                        status: 1,
                        "user.name": 1,
                        "user.email": 1,
                        "movie.moviename": 1,
                        "movie.genre": 1,
                        "movie.language": 1,
                        "theater.theatername": 1,
                        "theater.location": 1,
                    },
                },
            ]);

            res.status(200).json({
                message: "All bookings fetched successfully",
                total: allBookings.length,
                data: allBookings,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

}

const bookingController = new BookingController()
export { bookingController }