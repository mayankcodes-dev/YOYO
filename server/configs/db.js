import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    
    try {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
            isConnected = true;
        });
        mongoose.connection.on('error', () => {
            isConnected = false;
        });
        mongoose.connection.on('disconnected', () => {
            isConnected = false;
        });
        
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
        });
        
        isConnected = true;
    } catch(err) {
        isConnected = false;
        throw err;
    }
}

export default connectDB;