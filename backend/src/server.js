import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import resourceRoutes from './routes/resourceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`ResourceLink API running on http://localhost:${PORT}`);
});