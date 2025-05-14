import nodemailer from "nodemailer";
import { db, EMAIL_USER, EMAIL_PASS } from "../env.js";
import { v4 as uuidv4 } from "uuid";

//generate user id
export const generateUseIdService = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(USER_ID) as USER_ID FROM users`;
    db.query(query, (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      let id;
      const USER_ID = result[0].USER_ID;
      if (USER_ID) {
        const numberpart = parseInt(USER_ID.split("-")[1], 10);
        const newnumberpart = String(numberpart + 1).padStart(6, "0");
        id = `USE-${newnumberpart}`;
      } else {
        id = `USE-000001`;
      }
      resolve({ newid: id });
    });
  });
};

// Function to add user data to the database
export const adduserService = (
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
) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();

    const insertUser = () => {
      const query = `INSERT INTO users (USER_ID, FIRST_NAME, LAST_NAME, ROLE, EMAIL, PHONE_NUMBER, LINE_1, IMAGE, LINE_2, CITY, SATATE, POSTAL_CODE, PASSWORD , STATUS) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      db.query(
        query,
        [
          code,
          firstName,
          lastName,
          role,
          email,
          phone,
          addressLine1,
          image,
          addressLine2,
          city,
          state,
          postalCode,
          id,
          status,
        ],
        (error, result) => {
          if (error) {
            reject({ message: "Something went wrong, Please try again!" });
            return;
          }
          resolve({ message: "Member created successfully!" });
        }
      );
    };

    if (role === "Supplier") {
      // Skip email and insert directly
      insertUser();
    } else {
      // Proceed with email and insert after sending
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Dental Clinic - Account Created",
        text: `Hi ${firstName} ${lastName},\n\nYour account has been created successfully. \nYou can register from : http://localhost:5173/registration?token=${id}\n\nThank you,\nDental Clinic`,
      };

      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          reject({
            message:
              "Something went wrong while sending email, Please try again!",
          });
          return;
        }
        insertUser();
      });
    }
  });
};

//get user data
export const getUserService = async (search = "", page = 1, limit = 5) => {
  return new Promise((resolve, reject) => {
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Number(limit));

    const roleFilter = ["Doctor", "Super Admin", "Assistant"];

    const countSql = `
      SELECT COUNT(*) as total
      FROM users
      WHERE ROLE IN (?, ?, ?)
      AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
    `;

    db.query(
      countSql,
      [...roleFilter, `%${search}%`, `%${search}%`, `%${search}%`],
      (countErr, countResult) => {
        if (countErr) {
          reject({ message: countErr.message });
          return;
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parsedLimit);

        const sql = `
          SELECT USER_ID, ROLE, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, LINE_1, IMAGE, LINE_2, CITY, SATATE, POSTAL_CODE, STATUS
          FROM users
          WHERE ROLE IN (?, ?, ?)
          AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
          ORDER BY USER_ID DESC
          LIMIT ?, ?
        `;

        db.query(
          sql,
          [
            ...roleFilter,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            (parsedPage - 1) * parsedLimit,
            parsedLimit,
          ],
          (err, result) => {
            if (err) {
              reject({ message: err.message });
            } else {
              resolve({
                data: result,
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
              });
            }
          }
        );
      }
    );
  });
};

//get Supplier data
export const getSupplierService = async (search = "", page = 1, limit = 5) => {
  return new Promise((resolve, reject) => {
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Number(limit));

    const roleFilter = ["Supplier"];

    const countSql = `
      SELECT COUNT(*) as total
      FROM users
      WHERE ROLE IN (?)
      AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
    `;

    db.query(
      countSql,
      [...roleFilter, `%${search}%`, `%${search}%`, `%${search}%`],
      (countErr, countResult) => {
        if (countErr) {
          reject({ message: countErr.message });
          return;
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parsedLimit);

        const sql = `
          SELECT USER_ID, ROLE, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, LINE_1, IMAGE, LINE_2, CITY, SATATE, POSTAL_CODE, STATUS
          FROM users
          WHERE ROLE IN (?)
          AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
          ORDER BY USER_ID DESC
          LIMIT ?, ?
        `;

        db.query(
          sql,
          [
            ...roleFilter,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            (parsedPage - 1) * parsedLimit,
            parsedLimit,
          ],
          (err, result) => {
            if (err) {
              reject({ message: err.message });
            } else {
              resolve({
                data: result,
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
              });
            }
          }
        );
      }
    );
  });
};

//get Pateint data
export const getPateintService = async (search = "", page = 1, limit = 5) => {
  return new Promise((resolve, reject) => {
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Number(limit));

    const roleFilter = ["patient"];

    const countSql = `
      SELECT COUNT(*) as total
      FROM users
      WHERE ROLE IN (?)
      AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
    `;

    db.query(
      countSql,
      [...roleFilter, `%${search}%`, `%${search}%`, `%${search}%`],
      (countErr, countResult) => {
        if (countErr) {
          reject({ message: countErr.message });
          return;
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parsedLimit);

        const sql = `
          SELECT USER_ID, ROLE, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, LINE_1, IMAGE, LINE_2, CITY, SATATE, POSTAL_CODE, STATUS
          FROM users
          WHERE ROLE IN (?)
          AND (USER_ID LIKE ? OR FIRST_NAME LIKE ? OR LAST_NAME LIKE ?)
          ORDER BY USER_ID DESC
          LIMIT ?, ?
        `;

        db.query(
          sql,
          [
            ...roleFilter,
            `%${search}%`,
            `%${search}%`,
            `%${search}%`,
            (parsedPage - 1) * parsedLimit,
            parsedLimit,
          ],
          (err, result) => {
            if (err) {
              reject({ message: err.message });
            } else {
              resolve({
                data: result,
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
              });
            }
          }
        );
      }
    );
  });
};

//edit Pateint data
export const editPateintService = (userId, status) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET STATUS = ? WHERE USER_ID = ?`;
    db.query(query, [status, userId], (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      resolve({ message: "Pateint updated successfully!" });
    });
  });
};

//edit user
export const edituserService = (
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
) => {
  return new Promise((resolve, reject) => {
    // Base query and parameters
    let query = `
      UPDATE users SET 
        FIRST_NAME = ?, 
        LAST_NAME = ?, 
        ROLE = ?, 
        EMAIL = ?, 
        PHONE_NUMBER = ?, 
        LINE_1 = ?, 
    `;
    const params = [firstName, lastName, role, email, phone, addressLine1];

    if (image !== null) {
      query += `IMAGE = ?, `;
      params.push(image);
    }

    query += `
        LINE_2 = ?, 
        CITY = ?, 
        SATATE = ?, 
        POSTAL_CODE = ?, 
        STATUS = ?
      WHERE USER_ID = ?
    `;
    params.push(addressLine2, city, state, postalCode, status, code);

    db.query(query, params, (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      resolve({ message: "Member updated successfully!" });
    });
  });
};

//get supplier dd list
export const getSupplierDDlistService = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT USER_ID,CONCAT(FIRST_NAME, ' ', LAST_NAME) AS NAME  FROM users WHERE STATUS = 1 AND ROLE = 'Supplier'`;
    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};

//get doctor dd list
export const getDoctorDDlistService = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT USER_ID,CONCAT(FIRST_NAME, ' ', LAST_NAME) AS NAME  FROM users WHERE STATUS = 1 AND ROLE = 'Doctor' OR ROLE = 'Super Admin'`;
    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};

//get relavant user account dd list
export const getDDListService = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT related_accounts.RELATED_ID , related_accounts.RELATIONSHIP , CONCAT(users.FIRST_NAME, ' ', users.LAST_NAME) AS NAME 
    FROM related_accounts INNER JOIN users ON related_accounts.RELATED_ID = users.USER_ID
    WHERE related_accounts.MAIN_ID = ?`;
    db.query(sql, [userId], (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};

//get patient dd list
export const getPatientDDListService = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT USER_ID,CONCAT(FIRST_NAME, ' ', LAST_NAME) AS NAME  FROM users WHERE STATUS = 1 AND ROLE = 'patient'`;
    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};
