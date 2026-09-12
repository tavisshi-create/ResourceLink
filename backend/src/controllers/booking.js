import { supabase } from '../config/supabase.js';

// Phase 1: Submit intent/purpose (No payment demanded yet)
export const requestBooking = async (req, res) => {
    const { slotId, purpose, researcherName } = req.body;
    const renterId = req.user.id; 

    try {
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert({
                slot_id: slotId,
                renter_id: renterId,
                purpose_statement: purpose,
                researcher_name: researcherName,
                approval_status: 'pending_approval' 
            })
            .select()
            .single();

        if (error) throw error;
        
        res.status(202).json({ 
            success: true, 
            message: "Booking request submitted. Awaiting facility manager approval.", 
            booking 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Phase 2: Handle x402 payment and finalize the booking
export const finalizeBooking = async (req, res) => {
    const { bookingId, slotId } = req.body;
    const txId = req.x402?.payment?.transactionId || req.x402?.receipt?.transactionId || req.x402?.txId;

    // If the middleware passed but the transaction ID is missing, reject the request safely without crashing the server.
    if (!txId) {
        return res.status(400).json({ 
            success: false, 
            error: "Payment verification failed. No valid Algorand Testnet transaction ID found." 
        });
    }
    try {
        // 1. Update the booking with the Algorand transaction ID (Proof-of-Usage)
        const { error: bookingErr } = await supabase
            .from('bookings')
            .update({ 
                approval_status: 'confirmed', 
                algorand_tx_id: txId 
            })
            .eq('id', bookingId);
            
        if (bookingErr) throw bookingErr;
        // 2. Lock the time slot so no one else can book it
        const { error: slotErr } = await supabase
            .from('time_slots')
            .update({ status: 'booked' })
            .eq('id', slotId);
            
        if (slotErr) throw slotErr;
        // 3. Return the transaction ID so Person 1 can display it to the user
        res.status(200).json({ 
            success: true, 
            message: "Proof-of-Usage recorded securely on Algorand.",
            transactionId: txId 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};