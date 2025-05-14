import {
  addTreamentDataService,
  getTreamentDataService,
  editTreamentDataService,
  getWebTreamentDataService,
  ddlistService
} from "../services/treaments-service.js";

// add treament data
export const addTreamentDataController = async (req, res) => {
  const {
    name,
    indication,
    description,
    duration,
    status,
    cost,
    worstOutcome,
  } = req.body;

  if (
    !name ||
    !indication ||
    !description ||
    !duration ||
    !status ||
    !cost ||
    !worstOutcome
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const response = await addTreamentDataService(
      name,
      indication,
      description,
      duration,
      status,
      cost,
      worstOutcome
    );
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get treament data
export const getTreamentDataController = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const response = await getTreamentDataService(search, page, limit);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//edit treament data
export const editTreamentDataController = async (req, res) => {
  const {
    name,
    indication,
    description,
    duration,
    status,
    cost,
    key,
    worstOutcome,
  } = req.body;

  if (
    !name ||
    !indication ||
    !description ||
    !duration ||
    !status ||
    !cost ||
    !key||
    !worstOutcome
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const response = await editTreamentDataService(
      name,
      indication,
      description,
      duration,
      status,
      cost,
      key,
      worstOutcome
    );
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get treament data for web
export const getWebTreamentDataController = async (req, res) => {
  try {
    const response = await getWebTreamentDataService();
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//dd list
export const ddlistController = async (req, res) => {
  try {
    const response = await ddlistService();
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
