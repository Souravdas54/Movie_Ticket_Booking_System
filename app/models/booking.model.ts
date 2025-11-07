import { model, Schema } from "mongoose";
import { BookingInterface } from "../interface/booking.interface";

const bookingSchema = new Schema<BookingInterface>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
        theater: { type: Schema.Types.ObjectId, ref: "Theater", required: true },
        showTime: { type: String, required: true },
        numberOfTickets: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        status: { type: String, default: "Booked" },
    },
    { timestamps: true }
);

const bookingModel = model<BookingInterface>("Booking", bookingSchema);

export { bookingModel }