import express from "express";
import {
  addTreamentDataController,
  editTreamentDataController,
  getTreamentDataController,
  getWebTreamentDataController,
  ddlistController
} from "../controllers/treaments-controller.js";

const router = express.Router();

//create a treament
router.post("/add", addTreamentDataController);
//get treameant data
router.post("/get", getTreamentDataController);
//edit treament data
router.put('/edit', editTreamentDataController);
//get data for wed
router.get('/get/web', getWebTreamentDataController);
//dd list
router.get('/ddlist', ddlistController);

export default router;
