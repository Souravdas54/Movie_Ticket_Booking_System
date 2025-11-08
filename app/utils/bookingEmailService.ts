// emailSend.ts - Add these methods to your existing EmailService class
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
interface BookingDetails {
  _id: string;
  movieDetails: {
    moviename: string;
    genre?: string;
    duration?: string;
  };
  theaterDetails: {
    name: string;
    location: string;
  };
  showTime: Date | string;
  screenNumber?: number;
  numberOfTickets: number;
  totalAmount: number;
  status: string;
  createdAt: Date | string;
}
class bookingEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Booking Email transporter is ready');
    } catch (error) {
      console.error('❌ Email transporter configuration error:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const mailOptions = {
        from: `"Movie Booking System" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }


  async sendBookingConfirmationEmail(
    email: string,
    name: string,
    bookingDetails: BookingDetails
  ): Promise<{ success: boolean; error?: string }> {

    const showTime = new Date(bookingDetails.showTime);
    const createdAt = new Date(bookingDetails.createdAt);
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .header { background: #372df7ff; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9fafb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; font-weight: bold; }
        .total { background: #4f46e5; color: black; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .status-confirmed { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Booking Confirmed!</h1>
          <p>Your movie tickets are booked successfully</p>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your booking has been confirmed. Here are your booking details:</p>
          
          <div class="booking-details">
            <h3>📋 Booking Summary</h3>
            <table class="table">
              <tr>
                <th>Booking ID</th>
                <td>${bookingDetails._id}</td>
              </tr>
              <tr>
                <th>Movie</th>
                <td>${bookingDetails.movieDetails.moviename}</td>
              </tr>
              <tr>
                <th>Theater</th>
                <td>${bookingDetails.theaterDetails.name}</td>
              </tr>
              <tr>
                <th>Location</th>
                <td>${bookingDetails.theaterDetails.location}</td>
              </tr>
              <tr>
                <th>Show Time</th>
                <td>${showTime.toLocaleString()}</td>
              </tr>
              <tr>
                <th>Screen</th>
                <td>${bookingDetails.screenNumber || 'N/A'}</td>
              </tr>
              <tr>
                <th>Tickets</th>
                <td>${bookingDetails.numberOfTickets}</td>
              </tr>
              <tr class="total">
                <th>Total Amount</th>
                <td>₹${bookingDetails.totalAmount}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td class="status-confirmed">${bookingDetails.status}</td>
              </tr>
              <tr>
                <th>Booking Date</th>
                <td>${createdAt.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <p><strong>🎟️ Important Information:</strong></p>
          <ul>
            <li>Please arrive at the theater 30 minutes before the show</li>
            <li>Carry a valid ID proof for verification</li>
            <li>Show this email or booking ID at the ticket counter</li>
            <li>Tickets are non-refundable except as per cancellation policy</li>
          </ul>

          <p>We hope you enjoy the movie! 🍿</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Movie Booking System. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `Booking Confirmed!\n\nHello ${name},\n\nYour booking has been confirmed.\n\nBooking 
    Details:\n- Booking ID: ${bookingDetails._id}\n- Movie: ${bookingDetails.movieDetails.moviename}\n- 
    Theater: ${bookingDetails.theaterDetails.name}\n- Location: ${bookingDetails.theaterDetails.location}\n- 
    Show Time: ${showTime.toLocaleString()}.toLocaleString()}\n- Tickets: ${bookingDetails.numberOfTickets}\n- 
    Total Amount: ₹${bookingDetails.totalAmount}\n- Status: ${bookingDetails.status}\n\nPlease arrive 30 minutes
     before showtime with valid ID.\n\nEnjoy your movie!`;

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed - ${bookingDetails.movieDetails.moviename}`,
      html,
      text
    });
  }

  async sendBookingCancellationEmail(
    email: string,
    name: string,
    bookingDetails: any
  ): Promise<{ success: boolean; error?: string }> {

    const showTime = new Date(bookingDetails.showTime);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9fafb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; font-weight: bold; }
        .total { background: #ef4444; color: black; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .status-cancelled { color: #ef4444; font-weight: bold; }
        .refund-info { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
          <p>Your booking has been cancelled successfully</p>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your booking has been cancelled as requested. Here are the details:</p>
          
          <div class="booking-details">
            <h3>📋 Cancelled Booking Summary</h3>
            <table class="table">
              <tr>
                <th>Booking ID</th>
                <td>${bookingDetails._id}</td>
              </tr>
              <tr>
                <th>Movie</th>
                <td>${bookingDetails.movieDetails.moviename}</td>
              </tr>
              <tr>
                <th>Theater</th>
                <td>${bookingDetails.theaterDetails.name}</td>
              </tr>
              <tr>
                <th>Show Time</th>
               <td>${showTime.toLocaleString()}</td>
              </tr>
              <tr>
                <th>Tickets</th>
                <td>${bookingDetails.numberOfTickets}</td>
              </tr>
              <tr class="total">
                <th>Amount Refunded</th>
                <td>₹${bookingDetails.totalAmount}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td class="status-cancelled">${bookingDetails.status}</td>
              </tr>
              <tr>
                <th>Cancellation Date</th>
                <td>${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="refund-info">
            <p><strong>💰 Refund Information:</strong></p>
            <p>The amount of <strong>₹${bookingDetails.totalAmount}</strong> will be refunded to your original payment method within 5-7 business days.</p>
          </div>

          <p>We're sorry to see you go! Hope to see you again soon for another great movie experience. 🎬</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Movie Booking System. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `Booking Cancelled\n\nHello ${name},\n\nYour booking has been cancelled.\n\nCancelled
     Booking Details:\n- Booking ID: ${bookingDetails._id}\n- Movie: ${bookingDetails.movieDetails
        .moviename}\n- Theater: ${bookingDetails.theaterDetails.name}\n- Show Time: 
     ${showTime.toLocaleString()}.toLocaleString()}\n- Tickets: ${bookingDetails.numberOfTickets}\n- 
     Amount Refunded: ₹${bookingDetails.totalAmount}\n- Status: ${bookingDetails.status}\n\nRefund 
     will be processed within 5-7 business days.\n\nHope to see you again soon!`;

    return this.sendEmail({
      to: email,
      subject: `Booking Cancelled - ${bookingDetails.movieDetails.moviename}`,
      html,
      text
    });
  }
}

export default new bookingEmailService();