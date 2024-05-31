import { Router } from "express";
import {
  changeUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";
import {upload}  from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// Secured  routes
router.route("/logout").post(
  verifyJWT, // we use next in method for avoiding any type of confusion for server
  logoutUser
);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeUserPassword);

router.route("/getUser").post(verifyJWT,getCurrentUser)

router.route("/update-User").patch(verifyJWT,updateUserDetails)

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateAvatar)

router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage") ,updateCoverImage)

router.route("/c/username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT,getUserWatchHistory)

export default router;
