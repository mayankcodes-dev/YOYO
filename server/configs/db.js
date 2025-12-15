import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });
        await mongoose.connect(`${process.env.MONGODB_URL}`)
    }catch(err){
        console.error('Error connecting to database:', err.message);
        console.error('Full error:', err);
    }
}

export default connectDB;