// src/utils/storage.util.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/auth.config';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId || '',
        secretAccessKey: config.awsSecretAccessKey || '',
    },
});

/**
 * Custom S3 storage class
 */
export class S3Storage {
    private bucket: string;
    private location: string;
    private allowOverwrite: boolean;

    /**
     * Constructor
     * @param location The S3 folder location
     * @param allowOverwrite Whether to allow file overwriting
     */
    constructor(location = 'uploads', allowOverwrite = false) {
        this.bucket = config.awsS3Bucket || '';
        this.location = location;
        this.allowOverwrite = allowOverwrite;
    }

    /**
     * Upload a file to S3
     * @param file The file buffer or path
     * @param filename Optional custom filename
     * @returns The S3 file key
     */
    async upload(file: Buffer | string, filename?: string): Promise<string> {
        if (!this.bucket) {
            throw new Error('S3 bucket not configured');
        }

        try {
            // Generate a unique filename if not provided
            const fileKey = filename || this.generateUniqueFilename(file);
            const key = `${this.location}/${fileKey}`;

            // Check if file exists and overwrite is disallowed
            if (!this.allowOverwrite) {
                try {
                    await s3Client.send(new GetObjectCommand({
                        Bucket: this.bucket,
                        Key: key,
                    }));

                    // If we reach here, file exists
                    throw new Error(`File ${key} already exists and overwrite is disabled`);
                } catch (error: any) {
                    // NoSuchKey error is expected and means we can proceed
                    if (error.name !== 'NoSuchKey') {
                        throw error;
                    }
                }
            }

            // Convert file path to buffer if needed
            let fileContent: Buffer;
            if (typeof file === 'string') {
                fileContent = fs.readFileSync(file);
            } else {
                fileContent = file;
            }

            // Upload file to S3
            await s3Client.send(new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: fileContent,
                ContentType: this.getContentType(fileKey),
            }));

            return key;
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    /**
     * Generate a presigned URL for file access
     * @param key The S3 object key
     * @param expiresIn Expiration time in seconds
     * @returns Presigned URL
     */
    async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
        if (!this.bucket) {
            throw new Error('S3 bucket not configured');
        }

        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            return await getSignedUrl(s3Client, command, { expiresIn });
        } catch (error) {
            console.error('S3 presigned URL error:', error);
            throw new Error('Failed to generate presigned URL');
        }
    }

    /**
     * Generate a unique filename
     * @param file File buffer or path
     * @returns Unique filename
     */
    private generateUniqueFilename(file: Buffer | string): string {
        const uuid = uuidv4();

        if (typeof file === 'string') {
            const ext = path.extname(file);
            return `${uuid}${ext}`;
        }

        // For buffers, use a generic extension
        return `${uuid}.bin`;
    }

    /**
     * Get content type based on file extension
     * @param filename Filename
     * @returns Content type
     */
    private getContentType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();

        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.json': 'application/json',
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }
}