import express from "express";
import {
  signUpController,
  getRegisterPageDataController,
  RegisterController,
  loginController,
} from "../controllers/auth-controller.js";

const router = express.Router();

// custome creation - signup
router.post("/createCustomer", signUpController);
//get register page data
router.get("/getRegisterPageData/:id", getRegisterPageDataController);
//register user
router.post("/registerUser", RegisterController);
// log in
router.post("/login", loginController);

export default router;
