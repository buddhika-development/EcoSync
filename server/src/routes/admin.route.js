// src/routes/admin.route.js
import { Router } from "express";
import { getAdminBinsController } from "../controller/adminController/admin.bins.controller.js";
import { getAdminFullBinsController } from "../controller/adminController/admin.fullbins.controller.js";
import {
    schedulePickupController,
    getPickupProgressController,
  } from "../controller/adminController/admin.pickups.controller.js";
import { getRecyclablesController } from "../controller/adminController/admin.recyclables.controller.js";

const adminRouter = Router();

// GET /api/admin/bins?status=FULL&areaId=...&search=...&page=1&pageSize=25
adminRouter.get("/bins", getAdminBinsController);
adminRouter.get("/full-bins", getAdminFullBinsController);
adminRouter.post("/pickups", schedulePickupController); 
adminRouter.get("/pickups/:orderId", getPickupProgressController);
adminRouter.get("/recyclables", getRecyclablesController);

export default adminRouter;
