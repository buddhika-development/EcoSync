import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const meRouter = Router();

meRouter.get("/me", requireAuth, (req, res) => {

    console.log("user req", req.user)
    return res.json({
        ok: true,
        data: {
            uid: req.user.uid,
            email: req.user.email,
            role: req.user.role,
            name: req.user.name,
        },
    })
})

export default meRouter;