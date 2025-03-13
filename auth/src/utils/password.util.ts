// src/utils/password.util.ts
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';

// Create a custom alphabet for password generation (excluding ambiguous characters)
const nanoid = customAlphabet('23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ!@#$%^&*', 12);

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Boolean indicating if password matches
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random password
 * @param length Password length (default: 12)
 * @returns Secure random password
 */
export const generatePassword = (length = 12): string => {
    return nanoid(length);
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and reason
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; reason?: string } => {
    if (password.length < 8) {
        return { isValid: false, reason: 'Password must be at least 8 characters long' };
    }

    // Check for number
    if (!/\d/.test(password)) {
        return { isValid: false, reason: 'Password must contain at least one number' };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, reason: 'Password must contain at least one uppercase letter' };
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, reason: 'Password must contain at least one lowercase letter' };
    }

    // Check for special character
    if (!/[!@#$%^&*]/.test(password)) {
        return { isValid: false, reason: 'Password must contain at least one special character (!@#$%^&*)' };
    }

    return { isValid: true };
};