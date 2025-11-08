import { bookingModel } from "../models/booking.model";
import { BookingInterface } from "../interface/booking.interface";
import mongoose from "mongoose";

class BookingRepository {

    // Book Tickets
    async createBooking(data: Partial<BookingInterface>) {
        try {
            const booking = new bookingModel(data);
            return await booking.save();
            
        } catch (error) {
            console.log(error);
        }
    }

    // Cancel Booking
    async cancleBooking(bookingId: string) {
        try {
            // const updateBkkoing = await bookingModel.findByIdAndUpdate(
            //     bookingId,
            //     { status: "Cancelled" },
            //     { new: true }
            // )

            const cancelBkkoing = await bookingModel.findById(bookingId)

            if(!cancelBkkoing) return null;
            
            await bookingModel.findByIdAndDelete(bookingId)

            return cancelBkkoing;

        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    }

    // Get Booking History
    async getBookingHistory(userId: string) {
        try {
            const findBookedHistory = await bookingModel.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
                        as: "$theatherDetails"
                    }
                },
                { $unwind: "$theatherDetails" },
                {
                    $project: {
                        _id: 1,
                        showTime: 1,
                        numberOfTickets: 1,
                        totalAmount: 1,
                        status: 1,
                        "movie.moviename": 1,
                        "theater.theatername": 1,
                        "theater.location": 1,

                    }
                }
            ]);

            return findBookedHistory;

        } catch (error) {
            console.error("Error fetching booking history:", error);
            throw error;

        }
    }

    // List of Theaters for a Movie
    async getTheaterByMovie(movieId: string) {
        try {
            const getMovieTheater = await mongoose.model('theater').aggregate([
                { $unwind: "$movies" },
                {
                    $match: {
                        "movies.movie": new mongoose.Types.ObjectId(movieId),
                    },
                },
                {
                    $project: {
                        _id: 0,
                        theatername: "$name",
                        location: "$location",
                        screenNumber: "$movies.screenNumber",
                        showTimings: "$movies.showTimings",
                    },
                }
            ])

            return getMovieTheater;
        } catch (error) {
            console.error("Error fetching theaters by movie:", error);
            throw error;
        }
    }

    // List of Movies with Total Bookings
    async getMoviesWithTotalBookings() {
        try {
            const result = await bookingModel.aggregate([
                {
                    $group: {
                        _id: "$movie",
                        totalTicketsBooked: { $sum: "$numberOfTickets" },
                    },
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "_id",
                        foreignField: "_id",
                        as: "movie",
                    },
                },
                { $unwind: "$movie" },
                {
                    $project: {
                        moviename: "$movie.moviename",
                        genre: "$movie.genre",
                        totalTicketsBooked: 1,
                        _id: 0,
                    },
                },
            ]);
            return result;
        } catch (error) {
            console.error("Error fetching movie report:", error);
            throw error;
        }
    }

    // Bookings grouped by theater
    async getBookingsByTheater() {
        try {
            const result = await bookingModel.aggregate([
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
                        from: "movies",
                        localField: "movie",
                        foreignField: "_id",
                        as: "movie",
                    },
                },
                { $unwind: "$movie" },
                {
                    $group: {
                        _id: {
                            theater: "$theater.name",
                            movie: "$movie.moviename",
                            showTime: "$showTime",
                        },
                        totalTickets: { $sum: "$numberOfTickets" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        theater: "$_id.theater",
                        movie: "$_id.movie",
                        showTime: "$_id.showTime",
                        totalTickets: 1,
                    },
                },
            ]);
            return result;
        } catch (error) {
            console.error("Error fetching bookings by theater:", error);
            throw error;
        }
    }
};

const bookingRepository = new BookingRepository()
export { bookingRepository }