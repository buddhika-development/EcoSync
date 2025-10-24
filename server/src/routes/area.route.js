import { Router } from "express";
import { getAreasController } from "../controller/areaController/area.controller.js";
import { requireAuth } from "../middleware/auth.js";

const areaRouter = Router();

// GET /api/areas
areaRouter.get("/", requireAuth, getAreasController);

export default areaRouter;