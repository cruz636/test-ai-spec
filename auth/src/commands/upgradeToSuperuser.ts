// src/commands/upgradeToSuperuser.ts
import { Command } from 'commander';
import User from '../models/user.model';
import { connectDB, disconnectDB } from '../config/db.config';

const program = new Command();

program
    .name('upgradetosuperuser')
    .description('Elevate existing user to administrator status')
    .option('-e, --email <email>', 'User email')
    .action(async (options) => {
        try {
            // Validate email
            if (!options.email) {
                console.error('Error: Email is required');
                process.exit(1);
            }

            // Connect to database
            await connectDB();

            // Find the user
            const user = await User.findOne({ email: options.email });
            if (!user) {
                console.error(`Error: User with email ${options.email} not found`);
                await disconnectDB();
                process.exit(1);
            }

            // Check if user is verified and active
            if (!user.isVerified) {
                console.error(`Error: User with email ${options.email} is not verified`);
                await disconnectDB();
                process.exit(1);
            }

            if (!user.isActive) {
                console.error(`Error: User with email ${options.email} is not active`);
                await disconnectDB();
                process.exit(1);
            }

            // Check if user is already a superuser
            if (user.isSuperuser) {
                console.log(`User with email ${options.email} is already a superuser`);
                await disconnectDB();
                process.exit(0);
            }

            // Upgrade user to superuser
            user.isSuperuser = true;
            await user.save();

            console.log(`User ${options.email} has been upgraded to superuser status successfully`);

            await disconnectDB();
            process.exit(0);
        } catch (error) {
            console.error('Error upgrading user to superuser:', error);
            await disconnectDB();
            process.exit(1);
        }
    });

program.parse(process.argv);