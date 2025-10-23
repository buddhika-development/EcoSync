// Use Case Layer: contains business rules only (SRP)
// Applies Dependency Inversion Principle (depends on repository abstraction)

import { fail } from "../../../libs/response.js";

export default class CreateRecyclableRequestUsecase {
    constructor(repository) {
        this.repository = repository; // Injected dependency (DIP)
    }

    async execute(input) {
        // Simple validation logic before DB operation
        const { user_id, area_id, type, category, weight } = input;

        if (!user_id || !area_id || !type || !category || !weight) {
            // Return consistent structure for validation failure
            return fail(null, "Validation Error: Missing required fields", 400, {
                missing: { user_id, area_id, type, category, weight },
            });
        }

        if (isNaN(weight) || Number(weight) <= 0) {
            return fail(null, "Validation Error: Invalid weight", 400);
        }

        // Proceed with repository call
        const created = await this.repository.create(input);

        return {
            ok: true,
            status: 201,
            message: "Recyclable collect request created successfully",
            data: created,
        };
    }
}
