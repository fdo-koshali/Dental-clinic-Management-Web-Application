import express from "express";
import {
  generateItemIDController,
  addItemDataController,
  getItemDataController,
  editItemDataController,
  getItemStockController,
  getItemDDListController,
  generateOrderIdController,
  addRequestOrderDataController,
  getRequestOrderDataController,
  editRequestDataController,
  addGrnDataController,
  getGrnDataController
} from "../controllers/item-controller.js";

const router = express.Router();

//generate item ID
router.get("/get/ID", generateItemIDController);
// add item data
router.post("/add", addItemDataController);
// get item data
router.post("/get", getItemDataController);
// edit item data
router.put("/edit", editItemDataController);
//get item stock data
router.post("/get/stock", getItemStockController);
//get item dd list
router.get('/get/itemdd', getItemDDListController)
//GENERATE ORDER ID
router.get("/generateOrderId", generateOrderIdController);
//add requesst order
router.post('/add/requestOrder', addRequestOrderDataController)
//get item request data
router.post('/get/requestOrder', getRequestOrderDataController)
//edit request order data
router.put('/edit/requestOrder', editRequestDataController)
//add grn data
router.post('/add/grn', addGrnDataController)
//get grn data
router.post('/get/grn', getGrnDataController)

export default router;
