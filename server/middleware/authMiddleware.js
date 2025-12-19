import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// Middleware to check if user is authenticated
const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.json({ success: false, message: 'not authenticated' })
        }
        
        let user = await User.findById(userId);
        
        // If user doesn't exist in MongoDB, create them from Clerk data
        if (!user) {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const userData = {
                    _id: clerkUser.id,
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    username: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.emailAddresses[0]?.emailAddress || 'User',
                    image: clerkUser.imageUrl || '',
                };
                user = await User.create(userData);
            } catch (clerkError) {
                return res.json({ success: false, message: 'user not found' });
            }
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default protect;