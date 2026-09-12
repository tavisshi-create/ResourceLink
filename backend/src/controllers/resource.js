import { supabase } from '../config/supabase.js';

// GET: Fetch all resources for the frontend map and AI matching engine
export const getAllResources = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('resources')
            .select(`
                *,
                institutions (
                    name,
                    is_verified,
                    trust_score,
                    latitude,
                    longitude
                ),
                time_slots (*)
            `);
            
        if (error) throw error;
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST: Add new equipment (Protected by requireAuth middleware)
export const addResource = async (req, res) => {
    const institutionId = req.user.id; 
    const { 
        name, 
        facility_name, 
        category,
        capability_tags, 
        make_model,
        requires_approval, 
        operator_required,
        hourly_rate_algo 
    } = req.body;

    try {
        const { data, error } = await supabase
            .from('resources')
            .insert({
                institution_id: institutionId,
                name,
                facility_name,
                category,
                capability_tags,
                make_model, 
                requires_approval,
                operator_required,
                hourly_rate_algo
            })
            .select();

        if (error) throw error;
        
        res.status(201).json({ 
            success: true, 
            message: "Resource successfully published to the network.",
            resource: data[0] 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};