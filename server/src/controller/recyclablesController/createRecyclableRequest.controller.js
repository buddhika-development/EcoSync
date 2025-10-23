// Controller Pattern: handles HTTP and delegates logic to usecase (SRP)
// No business logic here, only request/response management

import { okay, fail } from "../../../libs/response.js";
import CreateRecyclableRequestRepository from "../../repositories/recyclablesRepository/createRecyclableRequest.repository.js";
import CreateRecyclableRequestUsecase from "../../usecase/recyclablesUsecase/createRecyclableRequestUsecase.js";

export default async function CreateRecyclableRequestController(req, res) {
    try {
        // Example: if your auth middleware sets req.user, use it; else fallback to body
        const user_id = req.user?.id || req.body.user_id;

        const input = {
            user_id,
            area_id: req.body.area_id,
            type: req.body.type,
            category: req.body.category,
            weight: req.body.weight,
            status: req.body.status,
        };

        const repository = new CreateRecyclableRequestRepository();
        const usecase = new CreateRecyclableRequestUsecase(repository);

        const result = await usecase.execute(input);

        if (!result.ok) {
            return fail(res, result.message, result.status || 400, result.errors);
        }

        return okay(res, result.data, result.message, result.status);
    } catch (error) {
        console.error("Error creating recyclable request:", error);
        return fail(res, "Internal Server Error", 500, { error: error.message });
    }
}
