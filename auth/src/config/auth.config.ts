// src/config/auth.config.ts
import dotenv from 'dotenv';

dotenv.config();

export default {
    // JWT settings
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',

    // Email configuration
    emailHost: process.env.EMAIL_HOST || 'smtp.example.com',
    emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
    emailSecure: process.env.EMAIL_SECURE === 'true',
    emailUser: process.env.EMAIL_USER || 'user@example.com',
    emailPassword: process.env.EMAIL_PASSWORD || 'password',

    // Application settings
    appUrl: process.env.APP_URL || 'http://localhost:3000',

    // AWS S3 Settings
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsS3Bucket: process.env.AWS_S3_BUCKET,
};