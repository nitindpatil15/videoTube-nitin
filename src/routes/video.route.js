import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import verifyJWT from "../middleware/auth.middleware.js";
import {upload}  from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videodoc",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },

        ]),
        publishAVideo
    );

router.route("/videoId").get(getVideoById)
router.route("/:_id").delete(deleteVideo)
router.route("/:_id").patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:_id").patch(togglePublishStatus);

export default router