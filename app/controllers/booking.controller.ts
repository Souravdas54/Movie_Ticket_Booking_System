import { Request, Response } from "express";
import { bookingRepository } from "../repositories/booking.repository";
import { BookingInterface } from "../interface/booking.interface";
import { userModel } from "../models/user.Model";
import { movieModel } from "../models/movie.model";
import { theaterModel } from "../models/theater.model";
import { bookingModel } from "../models/booking.model";
import mongoose from "mongoose";
import bookingEmailService from '../utils/bookingEmailService'
import { threadName } from "worker_threads";

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

            if (!booking) {
                res.status(400).json({
                    success: false,
                    message: "Failed to create booking"
                });
                return;
            }

            // Email details for confirmation
            const bookingDetails = {
                _id: booking._id.toString(),
                movieDetails: {
                    moviename: findMovie.moviename,
                    genre: findMovie.genre,
                    duration: findMovie.duration,
                    // screenNumber:findMovie.screenNumber,
                },
                theaterDetails: {
                    name: findTheater.theatername,
                    location: findTheater.location,
                },
                showTime: booking.showTime,
                numberOfTickets: booking.numberOfTickets,
                totalAmount: booking.totalAmount,
                status: "Confirmed",
                createdAt: (booking as any).createdAt,
            };

            // Send confirmation email
            await bookingEmailService.sendBookingConfirmationEmail(
                findUser.email,
                findUser.name,
                bookingDetails
            );

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
    async cancelBooking(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.params;

            console.log('Cancelling booking:', bookingId);

            const bookingWithDetails = await bookingModel.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(bookingId) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movieDetails"
                    }
                },
                { $unwind: "$movieDetails" },
                {
                    $lookup: {
                        from: "theaters",
                        localField: "theater",
                        foreignField: "_id",
                        as: "theaterDetails"
                    }
                },
                { $unwind: "$theaterDetails" },
                {
                    $project: {
                        _id: 1,
                        showTime: 1,
                        screenNumber: 1,
                        numberOfTickets: 1,
                        totalAmount: 1,
                        status: 1,
                        user: 1,
                        movie: 1,
                        theater: 1,
                        "userDetails.name": 1,
                        "userDetails.email": 1,
                        "movieDetails.moviename": 1,
                        "movieDetails.genre": 1,
                        "theaterDetails.theatername": 1,
                        "theaterDetails.location": 1,
                        "theaterDetails.movies": 1,
                        createdAt: 1
                    }
                }
            ]);

            console.log('Booking details found:', bookingWithDetails.length);

            if (bookingWithDetails.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
                return;
            }

            const bookingDetail = bookingWithDetails[0];

            // Find the screen number from theater movies array
            let screenNumber = "N/A";
            if (bookingDetail.theaterDetails.movies && Array.isArray(bookingDetail.theaterDetails.movies)) {
                const matchedScreen = bookingDetail.theaterDetails.movies.find(
                    (m: any) => m.movie && m.movie.toString() === bookingDetail.movie.toString()
                );
                screenNumber = matchedScreen ? matchedScreen.screenNumber : "N/A";
            }

            // Now cancel the booking (delete from database)
            const cancelledBooking = await bookingRepository.cancleBooking(bookingId);

            if (!cancelledBooking) {
                res.status(404).json({
                    success: false,
                    message: "Failed to cancel booking"
                });
                return;
            }

            // Prepare email data
            const bookingDetails = {
                _id: bookingDetail._id.toString(),
                movieDetails: {
                    moviename: bookingDetail.movieDetails.moviename,
                    genre: bookingDetail.movieDetails.genre,
                },
                theaterDetails: {
                    name: bookingDetail.theaterDetails.theatername,
                    location: bookingDetail.theaterDetails.location,
                    screenNumber: screenNumber,
                },
                showTime: bookingDetail.showTime,
                numberOfTickets: bookingDetail.numberOfTickets,
                totalAmount: bookingDetail.totalAmount,
                status: "Cancelled",
                createdAt: bookingDetail.createdAt
            };

            console.log('Sending cancellation email to:', bookingDetail.userDetails.email);

            // Send cancellation email
            const emailResult = await bookingEmailService.sendBookingCancellationEmail(
                bookingDetail.userDetails.email,
                bookingDetail.userDetails.name,
                bookingDetails
            );

            if (!emailResult.success) {
                console.log('⚠️ Booking cancelled but email sending failed:', emailResult.error);
            }

            res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: {
                    _id: bookingDetail._id,
                    movie: bookingDetail.movieDetails.moviename,
                    theater: bookingDetail.theaterDetails.name,
                    showTime: bookingDetail.showTime,
                    numberOfTickets: bookingDetail.numberOfTickets,
                    totalAmount: bookingDetail.totalAmount,
                    status: "Cancelled"
                },
                // emailSent: emailResult.success
            });

        } catch (error: any) {
            console.error("Error cancelling booking:", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
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