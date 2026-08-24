import { Router } from 'express';
import authRoutes from './authRoutes';
import carRoutes from './carRoutes';
import bookingRoutes from './bookingRoutes';
import operationsRoutes from './operationsRoutes';
import statsRoutes from './statsRoutes';
import aiRoutes from './aiRoutes';

const v1Router = Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/cars', carRoutes);
v1Router.use('/bookings', bookingRoutes);
v1Router.use('/operations', operationsRoutes);
v1Router.use('/stats', statsRoutes);
v1Router.use('/ai', aiRoutes);

export default v1Router;
