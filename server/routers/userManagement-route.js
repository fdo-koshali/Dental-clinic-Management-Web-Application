import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import {
  addUserController,
  generateUserIdController,
  getUserCrontroller,
  editUserController,
  getSupplierCrontroller,
  getPateintCrontroller,
  editPateintCrontroller,
  getSupplierDDlistController,
  getDoctorDDListController,
  getDDListController,
  getPatientDDListController
} from "../controllers/userManagement-controller.js";
import { get } from "http";

const router = express.Router();

// Add static file serving
router.use('/images', express.static('images'));

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

//generate user id
router.get("/generateUserId", generateUserIdController);
//get user data
router.post("/get", getUserCrontroller);
//get supplier data
router.post("/getSupplier", getSupplierCrontroller);
//get pateint data
router.post("/getPateint", getPateintCrontroller);
//edit pateint data
router.put("/editPateint", editPateintCrontroller);
//get supplier dd list
router.get("/get/supplierddList", getSupplierDDlistController)
//get doctor dd list
router.get('/get/doctorDDList', getDoctorDDListController)
//get relavant user account dd list
router.get('/get/relevantUserDDList/:userId', getDDListController)
//get patient ddlist
router.get('/get/patientDDlist', getPatientDDListController)
//add user
router.post("/addUser", upload.single("image"), addUserController);
//update user
router.put("/editUser", upload.single("image"), editUserController);

export default router;
