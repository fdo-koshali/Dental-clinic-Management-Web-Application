import {
  adduserService,
  generateUseIdService,
  getUserService,
  edituserService,
  getSupplierService,
  getPateintService,
  editPateintService,
  getSupplierDDlistService,
  getDoctorDDlistService,
  getDDListService,
  getPatientDDListService
} from "../services/userManagement-service.js";

// generate user ID
export const generateUserIdController = async (req, res) => {
  try {
    const userId = await generateUseIdService();
    res.status(200).json(userId);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get user data
export const getUserCrontroller = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const response = await getUserService(search, page, limit);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get supplier data
export const getSupplierCrontroller = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const response = await getSupplierService(search, page, limit);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get Pateint data
export const getPateintCrontroller = async (req, res) => {
  const { search, page, limit } = req.body;
  try {
    const response = await getPateintService(search, page, limit);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// edit Pateint data
export const editPateintCrontroller = async (req, res) => {
  const { userId, status } = req.body;
  try {
    const response = await editPateintService(userId, status);
    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//add user
export const addUserController = async (req, res) => {
  const {
    code,
    addressLine1,
    addressLine2,
    city,
    email,
    phone,
    postalCode,
    role,
    state,
    status,
    firstName,
    lastName,
  } = req.body;
  const image = req.file ? req.file.filename : null;

  if (
    !code ||
    !addressLine1 ||
    !addressLine2 ||
    !city ||
    !email ||
    !phone ||
    !postalCode ||
    !role ||
    !state ||
    !status ||
    !firstName ||
    !lastName
  ) {
    return res.status(400).json({ error: "All data required!" });
  }

  try {
    const addNewUserResponse = await adduserService(
      code,
      addressLine1,
      addressLine2,
      city,
      email,
      phone,
      postalCode,
      role,
      state,
      status,
      firstName,
      lastName,
      image
    );
    res.status(200).json(addNewUserResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//edit user
export const editUserController = async (req, res) => {
  const {
    code,
    addressLine1,
    addressLine2,
    city,
    email,
    phone,
    postalCode,
    role,
    state,
    status,
    firstName,
    lastName,
  } = req.body;
  const image = req.file ? req.file.filename : null;

  if (
    !code ||
    !addressLine1 ||
    !addressLine2 ||
    !city ||
    !email ||
    !phone ||
    !postalCode ||
    !role ||
    !state ||
    !status ||
    !firstName ||
    !lastName
  ) {
    return res.status(400).json({ error: "All data required!" });
  }

  try {
    const addNewUserResponse = await edituserService(
      code,
      addressLine1,
      addressLine2,
      city,
      email,
      phone,
      postalCode,
      role,
      state,
      status,
      firstName,
      lastName,
      image
    );
    res.status(200).json(addNewUserResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get supplier dd list
export const getSupplierDDlistController = async (req, res) => {
  try {
    const DDList = await getSupplierDDlistService();
    res.status(200).json(DDList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get doctor dd list
export const getDoctorDDListController = async (req, res) => {
  try {
    const DDList = await getDoctorDDlistService();
    res.status(200).json(DDList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get relavant user account dd list
export const getDDListController = async (req, res) => {
  const { userId } = req.params;
  try {
    const DDList = await getDDListService(userId);
    res.status(200).json(DDList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get patient dd list
export const getPatientDDListController = async (req, res) => {
  try {
    const DDList = await getPatientDDListService();
    res.status(200).json(DDList);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};