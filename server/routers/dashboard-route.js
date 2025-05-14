import express from "express";
import {
  getCardDataController,
  getMonthlyAppoinmnetController,
  getMonthlyIncomeController,
} from "../controllers/dashBoard-controller.js";

const router = express.Router();

//get card data
router.get("/getCardData", getCardDataController);
//month wise appoinment count
router.get("/monthly-appoinment", getMonthlyAppoinmnetController);
//month wise income nad expensive
router.get("/monthly-income", getMonthlyIncomeController);

export default router;
