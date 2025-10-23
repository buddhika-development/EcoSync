// Repository Pattern: handles only database communication (SRP)
// Depends on the shared supabase client (DIP)

import { supabase } from "../../../libs/supabase/supabase.js";

export default class CreateRecyclableRequestRepository {
    /**
     * Inserts a recyclable collect request into the DB
     * @param {Object} dto
     * @returns {Object} created row
     */
    async create(dto) {
        const { user_id, area_id, type, category, weight, status } = dto;
        console.log("Creating recyclable request in DB:", dto);

        const { data, error } = await supabase
            .from("recyclable_collect_request")
            .insert([
                {
                    user_id,
                    area_id,
                    type,
                    category,
                    weight,
                    status: status || "PENDING",
                },
            ])
            .select()
            .single();

        if (error) {
            // Throw meaningful error for upper layers to catch
            throw new Error("Database Error: Failed to create recyclable request");
        }

        return data;
    }
}
