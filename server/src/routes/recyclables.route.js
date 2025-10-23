import express from "express";
import CreateRecyclableRequestController from "../controller/recyclablesController/createRecyclableRequest.controller.js";
import { GetMyRecyclableRequestsController } from "../controller/recyclablesController/getMyRecyclableRequests.js";
import { requireAuth } from "../middleware/auth.js";

const recyclablesRouter = express.Router();

// Apply requireAuth middleware when ready (testing now)
recyclablesRouter.post("/create", CreateRecyclableRequestController);
recyclablesRouter.get('/requests/history',  requireAuth, GetMyRecyclableRequestsController);

export default recyclablesRouter;
