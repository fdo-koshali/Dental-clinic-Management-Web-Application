import {
  getCardDataControllerService,
  getMonthlyAppoinmnetService,
  getMonthlyIncomeService,
} from "../services/dashboard-service.js";

//get card data
export const getCardDataController = async (req, res) => {
  try {
    const cardData = await getCardDataControllerService();
    res.status(200).json(cardData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get monthly appoinmnet count
export const getMonthlyAppoinmnetController = async (req, res) => {
  try {
    const data = await getMonthlyAppoinmnetService();
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get monthly income
export const getMonthlyIncomeController = async (req, res) => {
  try {
    const data = await getMonthlyIncomeService();
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
