import { Router } from "express";
import {
  registerUser,
  loginuser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  getUserChannerProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginuser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/update-account").post(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannerProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
