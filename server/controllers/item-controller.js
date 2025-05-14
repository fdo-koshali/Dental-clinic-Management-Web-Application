import {
  getLastItemIDService,
  addItemDataService,
  getItemDataService,
  editItemDataService,
  getItemStockService,
  getItemDDListService,
  generatOrderIdService,
  addRequestOrderDataService,
  getRequestOrderDataService,
  editRequestDataService,
  addGrnDataService,
  getGrnDataService
} from "../services/item-service.js";

// generate item ID
export const generateItemIDController = async (req, res) => {
  try {
    const lastID = await getLastItemIDService();
    res.status(200).json(lastID);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// add material data
export const addItemDataController = async (req, res) => {
  const { code, name, description, status, unit } = req.body;
  console.log(req.body);
  if (!code || !name || !description || !status || !unit) {
    return res.status(400).json({ error: "All data required!" });
  }
  try {
    const addMaterialDataResponse = await addItemDataService(
      code,
      name,
      description,
      status,
      unit
    );
    res.status(200).json(addMaterialDataResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get item data
export const getItemDataController = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const materialData = await getItemDataService(page, limit, search);
    res.status(200).json(materialData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// edit material data
export const editItemDataController = async (req, res) => {
  const { code, name, description, status, unit } = req.body;
  if (!code || !name || !description || !status) {
    return res.status(400).json({ error: "All data required!" });
  }
  try {
    const editMaterialDataResponse = await editItemDataService(
      code,
      name,
      description,
      status,
      unit
    );
    res.status(200).json(editMaterialDataResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get meterila stock data
export const getItemStockController = async (req, res) => {
  const { search } = req.body;
  try {
    const materialStock = await getItemStockService(search);
    res.status(200).json(materialStock);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get item dd list
export const getItemDDListController = async (req, res) => {
  try {
    const itemDDList = await getItemDDListService();
    res.status(200).json(itemDDList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// generate user ID
export const generateOrderIdController = async (req, res) => {
  try {
    const userId = await generatOrderIdService();
    res.status(200).json(userId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// add request order data
export const addRequestOrderDataController = async (req, res) => {
  const { orderId, supplier, totalValue, items } = req.body;

  try {
    const addRequestOrderDataResponse = await addRequestOrderDataService(
      orderId, supplier, totalValue, items
    );
    res.status(200).json(addRequestOrderDataResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get item request data
export const getRequestOrderDataController = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const requestOrderData = await getRequestOrderDataService(page, limit, search);
    res.status(200).json(requestOrderData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// edit request order data
export const editRequestDataController = async (req, res) => {
  const { orderId, orderStatus, paymentAmount, paymentStatus } = req.body;
  try {
    const editRequestOrderDataResponse = await editRequestDataService(
      orderId, orderStatus, paymentAmount, paymentStatus
    );
    res.status(200).json(editRequestOrderDataResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// add grn data
export const addGrnDataController = async (req, res) => {
  const { itemId, quantity, receivedDate } = req.body;
  try {
    const addGrnDataResponse = await addGrnDataService(itemId, quantity, receivedDate);
    res.status(200).json(addGrnDataResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get grn data
export const getGrnDataController = async (req, res) => {
  const {page, limit } = req.body;
  try {
    const grnData = await getGrnDataService(page, limit);
    res.status(200).json(grnData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};