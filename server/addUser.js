import 'dotenv/config';
import User from './models/User.js';
import { clerkClient } from '@clerk/express';

export const addCurrentUser = async () => {
    try {
        // Get all users from Clerk
        const clerkUsers = await clerkClient.users.getUserList();

        // Add each Clerk user to MongoDB
        for (const clerkUser of clerkUsers.data) {
            const userData = {
                _id: clerkUser.id,
                email: clerkUser.emailAddresses[0].emailAddress,
                username: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.emailAddresses[0].emailAddress,
                image: clerkUser.imageUrl || '',
            };

            !(await User.findById(userData._id)) && await User.create(userData);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};
