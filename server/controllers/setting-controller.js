import {
  addHolidayService,
  getUpcomingHolidaysService,
  deleteHolidayService
} from "../services/setting-service.js";

//add holidays
export const addHolidayController = async (req, res) => {
  const { date } = req.body;
  try {
    const response = await addHolidayService(date);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get holidys
export const getUpcomingHolidays = async (req, res) => {
  try {
    const response = await getUpcomingHolidaysService();
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//delete holidays
export const deleteHolidayController = async (req, res) => {
  const { date } = req.body;
  try {
    const response = await deleteHolidayService(date);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
