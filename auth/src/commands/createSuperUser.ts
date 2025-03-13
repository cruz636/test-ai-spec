// src/commands/createSuperUser.ts
import { Command } from 'commander';
import User from '../models/user.model';
import { connectDB, disconnectDB } from '../config/db.config';
import { generatePassword } from '../utils/password.util';

const program = new Command();

program
    .name('createsuperuserauto')
    .description('Create a superuser with specified credentials')
    .option('-e, --email <email>', 'Email address')
    .option('-p, --password <password>', 'Password (optional, will generate if not provided)')
    .option('-n, --name <name>', 'User name (optional, defaults to "Admin")')
    .action(async (options) => {
        try {
            // Validate email
            if (!options.email) {
                console.error('Error: Email is required');
                process.exit(1);
            }

            // Connect to database
            await connectDB();

            // Check if user already exists
            const existingUser = await User.findOne({ email: options.email });
            if (existingUser) {
                console.error(`Error: User with email ${options.email} already exists`);
                await disconnectDB();
                process.exit(1);
            }

            // Generate password if not provided
            const password = options.password || generatePassword();

            // Create superuser
            const superuser = new User({
                email: options.email,
                name: options.name || 'Admin',
                password,
                isVerified: true,  // Auto-verify
                isActive: true,
                isSuperuser: true
            });

            await superuser.save();

            console.log(`Superuser created successfully:`);
            console.log(`- Email: ${options.email}`);
            console.log(`- Username: ${superuser.username}`);

            if (!options.password) {
                console.log(`- Password: ${password} (auto-generated)`);
                console.log('Please save this password in a secure location.');
            } else {
                console.log('- Password: (as specified)');
            }

            await disconnectDB();
            process.exit(0);
        } catch (error) {
            console.error('Error creating superuser:', error);
            await disconnectDB();
            process.exit(1);
        }
    });

program.parse(process.argv);