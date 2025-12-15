import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controllers/clerkWebhooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import bookingRouter from './routes/bookingRoutes.js';
import { addCurrentUser } from './addUser.js';



await connectDB();
connectCloudinary();
//adding current users from clerk to mongodb
await addCurrentUser();





const app = express();
app.use(cors()); //for connecting server and client

//API to listen to clerk webhooks (must be before express.json() middleware)
app.post('/api/clerk', express.json({ type: 'application/json' }), clerkWebhooks);

//middelwares
app.use(express.json());
app.use(clerkMiddleware())


app.get('/', (req, res) => {
    res.send('API is working...');
})
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);



const PORT = process.env.PORT || 3000;



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})