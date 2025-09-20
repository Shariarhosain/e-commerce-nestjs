import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    // Configure your email transporter here
    // For development, you can use Gmail or any SMTP service
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // your email
        pass: process.env.SMTP_PASS, // your email password or app password
      },
    });
  }

  async sendVerificationEmail(email: string, code: string, token: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering! Please use the verification code below to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${code}</h1>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Your App Team</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>Hello,</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Your App Team</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Helper method to generate a random 6-digit code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}