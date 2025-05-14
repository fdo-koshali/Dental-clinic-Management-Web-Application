import { db } from "../env.js";

//get profile details
export const getProfileDetailsService = async (userId) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT FIRST_NAME,LAST_NAME,EMAIL,PHONE_NUMBER,LINE_1,IMAGE,LINE_2,CITY,SATATE,POSTAL_CODE FROM users WHERE USER_ID = ?";
    db.query(query, [userId], (error, results) => {
      if (error) {
        return reject(error);
      }
      if (results.length === 0) {
        return reject(new Error("User not found"));
      }
      const profileData = results[0];
      resolve(profileData);
    });
  });
};

//edit Profile data
export const editProfileService = (
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
) => {
  return new Promise((resolve, reject) => {
    // Base query and parameters
    let query = `
        UPDATE users SET 
          FIRST_NAME = ?, 
          LAST_NAME = ?, 
          EMAIL = ?, 
          PHONE_NUMBER = ?, 
          LINE_1 = ?, 
      `;
    const params = [firstName, lastName, email, phone, addressLine1];

    if (image !== null) {
      query += `IMAGE = ?, `;
      params.push(image);
    }

    query += `
          LINE_2 = ?, 
          CITY = ?, 
          SATATE = ?, 
          POSTAL_CODE = ? 
        WHERE USER_ID = ?
      `;
    params.push(addressLine2, city, state, postalCode, registerNumber);

    db.query(query, params, (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }
      resolve({ message: "Member updated successfully!" });
    });
  });
};

//add related account
export const addRelatedAccountService = (email, firstName,lastName,mainId,relationship,relatedID) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (USER_ID,ROLE,FIRST_NAME,LAST_NAME,EMAIL,STATUS) VALUES (?,?,?,?,?,?)";
    const query1 = "INSERT INTO related_accounts (MAIN_ID, RELATED_ID, RELATIONSHIP) VALUES (?,?,?)";

    db.query(query,[relatedID,'patient',firstName,lastName,email, 1],(error, result) => {
        if (error) {
          reject({ message: error.message });
          return;
        }
        db.query(query1,[mainId,relatedID,relationship],(error, result) => {
          if (error) {
            reject({ message: error.message });
            return;
          }
          resolve({ message: "Related account added successfully!" });
        });
      }
    );
  });
};

//get related account
export const getRealatedAcountService = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.USER_ID, u.FIRST_NAME, u.LAST_NAME, u.EMAIL, u.PHONE_NUMBER, ra.RELATIONSHIP 
      FROM users u 
      JOIN related_accounts ra ON u.USER_ID = ra.RELATED_ID 
      WHERE ra.MAIN_ID = ?
    `;
    db.query(query, [userId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};