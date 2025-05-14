import express from "express";
import {
  generateIdController,
  findTimeSlotController,
  createAppointmentController,
  getUpcommingDataController,
  changeAppoinmnetStatusController,
  getTodayDataController,
  updateChargesController,
  changePaymnetStatusController,
  addItemsToPatientController,
  getAppoinmnetItemDataController,
  deleteAppoinmnetItemDataController,
  getPastDataController
} from "../controllers/appointment-controller.js";

const router = express.Router();

//generate  id
router.get("/generatId", generateIdController);
//find time slot
router.post("/find-time", findTimeSlotController);
//create appoinemts
router.post("/create", createAppointmentController);
//get upcoming appoinmnets data
router.post('/getUpCommingData', getUpcommingDataController);
//change appointment status
router.put('/status', changeAppoinmnetStatusController);
//get today appointment data
router.get('/todayAppointment', getTodayDataController);
//update chargers and notes
router.put('/update-charges', updateChargesController);
//change payment staus
router.put('/payment-status', changePaymnetStatusController);
//add items to pateint
router.post('/items', addItemsToPatientController);
//get appoinmnet item data
router.get('/items/:id', getAppoinmnetItemDataController);
//delete appoinment item data
router.delete('/items', deleteAppoinmnetItemDataController);
//get past appointment data
router.get('/getpast/:id', getPastDataController);

export default router;
