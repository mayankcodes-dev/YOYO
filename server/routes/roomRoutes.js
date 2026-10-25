import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createRoom,
    getRooms,
    getOwnerRooms,
    toggleRoomAvailability,
    updateRoom,
    deleteRoom,
} from '../controllers/roomController.js';
import {
    getViewerCount,
    joinRoom,
    leaveRoom,
} from '../controllers/viewersController.js';

const roomRouter = express.Router();

roomRouter.get('/',                    getRooms);
roomRouter.post('/',                   upload.array('images', 4), protect, createRoom);
roomRouter.get('/owner',               protect, getOwnerRooms);
roomRouter.post('/toggle-availability',protect, toggleRoomAvailability);
roomRouter.patch('/:id',               upload.array('images', 4), protect, updateRoom);
roomRouter.delete('/:id',              protect, deleteRoom);

// ── Live viewer count (Option B: Upstash Redis polling) ──────────
// Public — no auth needed, anonymous viewers count too.
roomRouter.get( '/:id/viewers',       getViewerCount);
roomRouter.post('/:id/viewers/join',  joinRoom);
roomRouter.post('/:id/viewers/leave', leaveRoom);

export default roomRouter;