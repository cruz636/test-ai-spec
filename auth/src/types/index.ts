// src/types/index.ts
import { Request } from 'express';

export interface UserPayload {
    id: string;
    email: string;
    isSuperuser: boolean;
    iat: number;
    exp: number;
}

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
    isSuperuser?: boolean;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        username: string;
        isSuperuser: boolean;
    };
    message?: string;
}

export interface SignupResponse {
    success: boolean;
    message: string;
    userId?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    errors?: any[];
}