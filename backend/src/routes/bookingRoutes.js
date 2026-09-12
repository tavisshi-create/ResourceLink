import express from 'express';
import { requestBooking, finalizeBooking } from '../controllers/booking.js';
import { requireAuth } from '../config/auth.js';
import { requirePayment } from '../config/x402.js';
const router = express.Router();
// POST /api/bookings/request — Phase 1: Submit purpose & researcher credentials
router.post('/request', requireAuth, requestBooking);
// POST /api/bookings/settle — Phase 2: x402 Algorand micropayment settlement
router.post('/settle',requirePayment("0.5"), finalizeBooking);
export default router;