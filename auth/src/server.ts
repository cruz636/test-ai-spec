// src/server.ts
import app from './app';
import { connectDB } from './config/db.config';
import dotenv from 'dotenv';

dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });