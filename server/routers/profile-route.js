import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import {
  getProfileDetailsController,
  editProfileController,
  addRelatedAccountController,
  getRealatedAcountController
} from "../controllers/profile-controller.js";

const router = express.Router();

// Add static file serving
router.use("/images", express.static("images"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

//get prodile details
router.get("/getProfile/:userId", getProfileDetailsController);
//add related account
router.post("/addRelatedAccount", addRelatedAccountController);
// get related account
router.get("/getRelatedAccount/:userId", getRealatedAcountController);
//update profile details
router.put("/updateProfile", upload.single("image"), editProfileController);

export default router;
