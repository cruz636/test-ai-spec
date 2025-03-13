// src/models/user.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
    id: string;
    email: string;
    name: string;
    username: string;
    password: string;
    isVerified: boolean;
    isActive: boolean;
    isSuperuser: boolean;
    verificationToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateUsername(): string;
}

const UserSchema = new Schema<IUser>({
    id: {
        type: String,
        default: () => uuidv4(),
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isSuperuser: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
}, {
    timestamps: true,
});

// Generate a unique username before saving
UserSchema.pre('save', async function (next) {
    // Only generate username if it doesn't exist
    if (!this.username) {
        this.username = this.generateUsername();
    }

    // Hash password only if it's modified or new
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error as Error);
        }
    }

    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate a unique username based on email and random string
UserSchema.methods.generateUsername = function (): string {
    const emailPrefix = this.email.split('@')[0];
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${emailPrefix}_${randomStr}`;
};

export default mongoose.model<IUser>('User', UserSchema);