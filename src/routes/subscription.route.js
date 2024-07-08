import { Router } from 'express';
import {
    getSubscribeCount,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId").post(toggleSubscription)
router.route("/c/:username").get(getSubscribeCount)


export default router