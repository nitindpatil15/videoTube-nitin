import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  videoviews
} from "../controllers/video.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllVideos)
  router.route('/').post(
    upload.fields([
      {
        name: "videodoc",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),verifyJWT,
    publishAVideo
  );

router
  .route("/:videoId")
  .get(verifyJWT,getVideoById)
  .delete(verifyJWT,deleteVideo)
  .patch(upload.single("thumbnail"),verifyJWT, updateVideo);

router.route("/view/:videoId").get(verifyJWT,videoviews)
router.route("/toggle/publish/:videoId").patch(verifyJWT,togglePublishStatus);

export default router;
