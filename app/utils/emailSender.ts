import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use createTransport (not createTransporter)
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
      console.log('✅ Email transporter is ready');
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

  async sendVerificationEmail(email: string, token: string, name: string): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: 'Arial', sans-serif; 
            border: 1px solid #e0e0e0;
            border-radius: 10px;
          }
          .header { 
            background: #4f46e5; 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            padding: 30px; 
            background: #f9fafb; 
            line-height: 1.6;
          }
          .button { 
            background: #4f46e5; 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280;
            font-size: 14px;
          }
          .verification-code {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Movie Booking System</h1>
            <h2>Email Verification</h2>
          </div>
          <div class="content">
            <h3>Hello ${name},</h3>
            <p>Welcome to <strong>Movie Booking System</strong>! We're excited to have you on board.</p>
            <p>To complete your registration and start booking movie tickets, please verify your email address by clicking the button below:</p>
            
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p><strong>Or copy and paste this link in your browser:</strong></p>
            <div class="verification-code">
              ${verificationUrl}
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>.</p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Movie Booking System. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Welcome to Movie Booking System!\n\nPlease verify your email by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Movie Booking System',
      html,
      text
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            font-family: 'Arial', sans-serif;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
          }
          .header { 
            background: #10b981; 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
          }
          .content { 
            padding: 30px; 
            background: #f9fafb;
            line-height: 1.6;
          }
          .feature {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #10b981;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome</h1>
            <p>Your email has been successfully verified</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <p><strong>You can now:</strong></p>
            <div class="feature">
              🎬 <strong>Browse movies</strong> - Explore the latest and greatest films
            </div>
            <div class="feature">
              💺 <strong>Book tickets</strong> - Reserve your seats in just a few clicks
            </div>
            <div class="feature">
              📱 <strong>Manage bookings</strong> - View and cancel your reservations
            </div>
            <div class="feature">
              👤 <strong>Update profile</strong> - Keep your information current
            </div>
            
            <p>We're thrilled to have you as part of our movie-loving community!</p>
            <p>Get ready for an amazing movie experience! 🍿</p>
            
            <p><strong>Happy movie watching!</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Movie Booking System! 🎬',
      html
    });
  }

  // Additional email methods you might need
  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Movie Booking System',
      html
    });
  }
}

export default new EmailService();