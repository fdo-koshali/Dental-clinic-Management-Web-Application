import {
  getProfileDetailsService,
  editProfileService,
  addRelatedAccountService,
  getRealatedAcountService,
} from "../services/profile-service.js";

//get profile details
export const getProfileDetailsController = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing required data" });
  }
  try {
    const profileData = await getProfileDetailsService(userId);
    res.status(200).json(profileData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//add related account
export const addRelatedAccountController = async (req, res) => {
  const { email, firstName,lastName,mainId,relationship,relatedID } = req.body;
  if (!email || !firstName || !lastName || !mainId || !relationship || !relatedID) {
    return res.status(400).json({ error: "Missing required data" });
  }
  try {
    // Assuming you have a service function to handle adding related accounts
    const addRelatedAccountResponse = await addRelatedAccountService(email, firstName,lastName,mainId,relationship,relatedID);
    res.status(200).json(addRelatedAccountResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//edit profile details
export const editProfileController = async (req, res) => {
  const {
    registerNumber,
    addressLine1,
    addressLine2,
    city,
    email,
    phone,
    postalCode,
    state,
    firstName,
    lastName,
  } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const addNewUserResponse = await editProfileService(
      registerNumber,
      addressLine1,
      addressLine2,
      city,
      email,
      phone,
      postalCode,
      state,
      firstName,
      lastName,
      image
    );
    res.status(200).json(addNewUserResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//get related account
export const getRealatedAcountController = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing required data" });
  }
  try {
    const relatedAccountData = await getRealatedAcountService(userId);
    res.status(200).json(relatedAccountData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
