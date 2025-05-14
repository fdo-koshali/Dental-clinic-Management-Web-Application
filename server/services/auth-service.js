import { db } from "../env.js";
import bcrypt from "bcrypt";
import util from 'util';

// create customer - signup
export const signUpService = (
  userId,
  firstName,
  lastName,
  email,
  password,
  userType,
  status
) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO users (USER_ID, FIRST_NAME, LAST_NAME, EMAIL, PASSWORD, ROLE , STATUS) VALUES (?,?,?,?,?,?,?)`;
    db.query(
      query,
      [userId, firstName, lastName, email, password, userType, status],
      (error, result) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            reject({ message: "Email already exists!" });
            return;
          } else {
            reject({ message: "Something went wrong, Please try again!" });
            return;
          }
        }
        resolve({ message: "Account created successfully!" });
      }
    );
  });
};

// get register page data
export const getRegisterPageDataService = async (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT USER_ID, FIRST_NAME, LAST_NAME, EMAIL,ROLE FROM users WHERE PASSWORD = ?`;
    db.query(query, [id], (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      if (result.length === 0) {
        reject({ message: "Invalid Link!" });
        return;
      }
      resolve(result[0]);
    });
  });
};

// register user
export const RegisterService = (userId, password) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET PASSWORD = ? WHERE USER_ID = ?`;
    db.query(query, [password, userId], (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      resolve({ message: "User registered successfully!" });
    });
  });
};

// login
export const loginService = async (email, password) => {
  const queryAsync = util.promisify(db.query).bind(db);
  try {
    const query = `
      SELECT users.USER_ID, users.EMAIL, users.FIRST_NAME, users.LAST_NAME, users.ROLE, users.PASSWORD,
             related_accounts.RELATED_ID
      FROM users
      LEFT JOIN related_accounts ON users.USER_ID = related_accounts.MAIN_ID
      WHERE users.EMAIL = ? AND users.STATUS = 1
    `;

    const result = await queryAsync(query, [email]);

    if (result.length === 0) {
      throw { message: "Invalid email or password!" };
    }

    const user = result[0];

    if (!password || !user.PASSWORD) {
      throw { message: "Invalid email or password!" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);
    if (!isPasswordValid) {
      throw { message: "Invalid email or password!" };
    }

    // Collect unique non-null RELATED_IDs
    const relatedIds = [
      ...new Set(result.map(row => row.RELATED_ID).filter(id => id !== null))
    ];

    const data = {
      id: user.USER_ID,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      relatedId: relatedIds,
      role: user.ROLE,
    };

    return { message: "Login successful!", data };
  } catch (error) {
    throw error.message ? error : { message: "Something went wrong, Please try again!" };
  }
};
