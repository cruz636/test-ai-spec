// src/commands/changePassword.ts
import { Command } from 'commander';
import User from '../models/user.model';
import { connectDB, disconnectDB } from '../config/db.config';
import { generatePassword, validatePasswordStrength } from '../utils/password.util';

const program = new Command();

program
    .name('customchangepassword')
    .description('Reset user password via command line')
    .option('-e, --email <email>', 'User email')
    .option('-p, --password <password>', 'New password (optional, will generate if not provided)')
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

            // Generate or validate password
            let password = options.password;
            if (!password) {
                password = generatePassword();
            } else {
                const validation = validatePasswordStrength(password);
                if (!validation.isValid) {
                    console.error(`Error: ${validation.reason}`);
                    await disconnectDB();
                    process.exit(1);
                }
            }

            // Update user password
            user.password = password;
            await user.save();

            console.log(`Password changed successfully for user: ${options.email}`);

            if (!options.password) {
                console.log(`- New password: ${password} (auto-generated)`);
                console.log('Please save this password in a secure location.');
            } else {
                console.log('- New password: (as specified)');
            }

            await disconnectDB();
            process.exit(0);
        } catch (error) {
            console.error('Error changing password:', error);
            await disconnectDB();
            process.exit(1);
        }
    });

program.parse(process.argv);