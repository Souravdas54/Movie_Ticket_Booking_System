import mongoose from "mongoose";

export interface BookingInterface {
  user: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  theater: mongoose.Types.ObjectId;
  showTime: string;
  numberOfTickets: number;
  totalAmount: number;
  status: string; // Booked / Cancelled
}