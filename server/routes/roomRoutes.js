import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { createRoom, getRooms, getOwnerRooms, toggleRoomAvailability } from '../controllers/roomController.js';
import protect from '../middleware/authMiddleware.js'; 

const roomRouter = express.Router();

roomRouter.post('/', upload.array('images', 4), protect, createRoom);
roomRouter.get('/', getRooms);
roomRouter.get('/owner',protect, getOwnerRooms);
roomRouter.post('/toggle-availability',protect, toggleRoomAvailability);

export default roomRouter;