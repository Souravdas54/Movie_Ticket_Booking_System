import { bookingModel } from "../models/booking.model";
import { BookingInterface } from "../interface/booking.interface";

class BookingRepository {

    async create(data: Partial<BookingInterface>) {
        try {
            const booking = new bookingModel(data);
            return await booking.save();
        } catch (error) {
            console.log(error);

        }

    }

    async findByBookedUser(userId: string) {
        try {
            const findBookedUser = await bookingModel.find({ user: userId }).populate("movie theater");
            return findBookedUser;
        } catch (error) {
            console.log(error);

        }
    }
};

const bookingRepository = new BookingRepository()
export { bookingRepository }