/**
 * Email Service - Uses Nodemailer with Brevo SMTP
 * Matches Laravel's email sending functionality
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send email verification notification
 * Matches Laravel: $member->sendEmailVerificationNotification()
 */
export const sendEmailVerification = async (user, verificationUrl) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'CRM System'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hello ${user.first_name || 'User'},</h2>
                <p>Please click the button below to verify your email address.</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #6777ef; color: white; text-decoration: none; border-radius: 4px;">
                        Verify Email Address
                    </a>
                </p>
                <p>If you did not create an account, no further action is required.</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to new member
 * Matches Laravel's welcome email functionality
 */
export const sendWelcomeEmail = async (user, password = null) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'CRM System'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: 'Welcome to CRM System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to CRM System!</h2>
                <p>Hello ${user.first_name || 'User'},</p>
                <p>Your account has been created successfully.</p>
                <table style="margin: 20px 0; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
                    </tr>
                    ${password ? `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
                    </tr>
                    ` : ''}
                </table>
                <p>Please login to your account and change your password.</p>
                <p style="text-align: center;">
                    <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login" 
                       style="display: inline-block; padding: 12px 24px; background-color: #6777ef; color: white; text-decoration: none; border-radius: 4px;">
                        Login Now
                    </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This is an automated email from CRM System.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetUrl) => {
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'CRM System'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: 'Reset Password Notification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p>Hello ${user.first_name || 'User'},</p>
                <p>You are receiving this email because we received a password reset request for your account.</p>
                <p style="text-align: center;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #6777ef; color: white; text-decoration: none; border-radius: 4px;">
                        Reset Password
                    </a>
                </p>
                <p>This password reset link will expire in 60 minutes.</p>
                <p>If you did not request a password reset, no further action is required.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Test SMTP connection
 */
export const testConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified');
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error);
        return false;
    }
};

export default {
    sendEmailVerification,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    testConnection
};
