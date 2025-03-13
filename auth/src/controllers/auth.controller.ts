// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model';
import { sendVerificationEmail } from '../services/email.service';
import config from '../config/auth.config';

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use'
            });
        }

        // Create verification token
        const verificationToken = uuidv4();

        // Create a new user
        const newUser = new User({
            email,
            name,
            password,
            verificationToken
        });

        await newUser.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email',
            userId: newUser.id
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Email not verified. Please verify your email before logging in'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Please contact administrator'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, isSuperuser: user.isSuperuser },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
        );

        // Return user data with token
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                isSuperuser: user.isSuperuser
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        // Find user by verification token
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Update user verification status
        user.isVerified = true;
        user.verificationToken = undefined; // Clear token after verification
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now login'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during email verification'
        });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal that the email doesn't exist
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive password reset instructions'
            });
        }

        // Generate reset token
        const resetToken = uuidv4();
        user.verificationToken = resetToken;
        await user.save();

        // Send password reset email
        // Implementation in email.service.ts
        // await sendPasswordResetEmail(email, resetToken);

        return res.status(200).json({
            success: true,
            message: 'If your email is registered, you will receive password reset instructions'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during password reset request'
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Find user by reset token
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear token
        user.password = password;
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during password reset'
        });
    }
};