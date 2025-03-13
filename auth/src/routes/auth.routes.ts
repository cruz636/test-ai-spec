// src/routes/auth.routes.ts
import express from 'express';
import * as authController from '../controllers/auth.controller';
import { validateSignupRequest, validateLoginRequest, validatePasswordResetRequest } from '../middleware/validation.middleware';

const router = express.Router();

// API version prefix: /api/v1

// Signup endpoint
router.post('/signup', validateSignupRequest, authController.signup);

// Login endpoint
router.post('/login', validateLoginRequest, authController.login);

// Email verification endpoint
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset request endpoint
router.post('/forgot-password', authController.requestPasswordReset);

// Password reset endpoint
router.post('/reset-password/:token', validatePasswordResetRequest, authController.resetPassword);

export default router;