// src/services/email.service.ts
import nodemailer from 'nodemailer';
import config from '../config/auth.config';

// Configure transporter
const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailSecure,
    auth: {
        user: config.emailUser,
        pass: config.emailPassword,
    },
});

/**
 * Send email verification email
 * @param email Recipient email
 * @param token Verification token
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
    const verificationUrl = `${config.appUrl}/api/v1/auth/verify-email/${token}`;

    const mailOptions = {
        from: `"Authentication System" <${config.emailUser}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify my email</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Send password reset email
 * @param email Recipient email
 * @param token Reset token
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
    const resetUrl = `${config.appUrl}/reset-password/${token}`;

    const mailOptions = {
        from: `"Authentication System" <${config.emailUser}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};