// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/auth.config';
import User from '../models/user.model';

interface DecodedToken {
    id: string;
    email: string;
    isSuperuser: boolean;
    iat: number;
    exp: number;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userEmail?: string;
            isSuperuser?: boolean;
        }
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

        // Set user info in request object
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.isSuperuser = decoded.isSuperuser;

        // Check if user still exists and is active
        const user = await User.findOne({ id: decoded.id });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
};

export const requireSuperuser = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isSuperuser) {
        return res.status(403).json({
            success: false,
            message: 'Superuser access required'
        });
    }
    next();
};