import {
  signUpService,
  getRegisterPageDataService,
  RegisterService,
  loginService,
} from "../services/auth-service.js";
import bcrypt from "bcrypt";

// create customer - signup
export const signUpController = async (req, res) => {
  const { firstName, lastName, email, password, userId, userType, status } =
    req.body;
  if (!firstName || !lastName || !email || !password || !userId || !userType) {
    return res.status(400).json({ error: "All data required!" });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const signUpResponse = await signUpService(
      userId,
      firstName,
      lastName,
      email,
      hashedPassword,
      userType,
      status
    );
    res.status(200).json(signUpResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get register page data
export const getRegisterPageDataController = async (req, res) => {
  const { id } = req.params;
  try {
    const registerPageData = await getRegisterPageDataService(id);
    res.status(200).json(registerPageData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// register user
export const RegisterController = async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: "All data required!" });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const registerResponse = await RegisterService(userId, hashedPassword);
    res.status(200).json(registerResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// login
export const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email & password are required!" });
  }
  try {
    const loginResponse = await loginService(email, password);
    res.status(200).json(loginResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
