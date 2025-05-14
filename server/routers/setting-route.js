import express from "express";
import {
  addHolidayController,
  getUpcomingHolidays,
  deleteHolidayController
} from "../controllers/setting-controller.js";

const router = express.Router();

//add holidays
router.post("/addHoliday", addHolidayController);
//get upcoming holidays
router.get("/get/upcoming", getUpcomingHolidays);
//delete holidays
router.delete('/deleteHoliday', deleteHolidayController)

export default router;
