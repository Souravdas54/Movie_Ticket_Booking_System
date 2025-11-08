import express from 'express';
import { bookingController } from '../controllers/booking.controller';
import { protect, authorizeRoles } from '../middleware/auth.middleaware';

const bookingRouter = express.Router()

bookingRouter.post('/book/ticket', protect, authorizeRoles('user'), bookingController.bookingTicket)
bookingRouter.get('/booking/history/:userId',protect,authorizeRoles('user','admin'),bookingController.viewBookingHistory)
bookingRouter.put('/booking/cancel/:bookingId',protect,authorizeRoles('user'),bookingController.cancelBooking)

// Admin can access 
bookingRouter.get('/booking/get-all',protect,authorizeRoles('admin'),bookingController.getAllBookings)

export { bookingRouter };