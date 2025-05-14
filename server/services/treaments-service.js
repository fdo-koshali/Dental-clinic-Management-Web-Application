import { db } from "../env.js";

// Function to add treatment data to the database
export const addTreamentDataService = async (
  name,
  indication,
  description,
  duration,
  status,
  cost,
  worstOutcome
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO treatment (NAME, INDICATION, DESCRIPTION, DURATION, COST, WORST_OUT_COME, STATUS) VALUES (?, ?, ?, ?, ?, ? , ?)`;
    db.query(
      sql,
      [name, indication, description, duration, cost, worstOutcome, status],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            reject({ message: "Data already exists!" });
          } else {
            reject({ message: err.message });
          }
        } else {
          resolve({ message: "Data added successfully!" });
        }
      }
    );
  });
};

// Function to get treatment data from the database
export const getTreamentDataService = async (
  search = "",
  page = 1,
  limit = 10
) => {
  return new Promise((resolve, reject) => {
    // Validate and parse pagination parameters
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.max(1, Number(limit));

    // Get total count first
    const countSql = `SELECT COUNT(*) as total FROM treatment WHERE NAME LIKE ? OR INDICATION LIKE ? OR DESCRIPTION LIKE ?`;
    db.query(
      countSql,
      [`%${search}%`, `%${search}%`, `%${search}%`],
      (countErr, countResult) => {
        if (countErr) {
          reject({ message: countErr.message });
          return;
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parsedLimit);

        // Get paginated data
        const sql = `SELECT * FROM treatment WHERE NAME LIKE ? OR INDICATION LIKE ? OR DESCRIPTION LIKE ? ORDER BY ID DESC LIMIT ?, ?`;
        db.query(
          sql,
          [
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

// Function to add treatment data to the database
export const editTreamentDataService = async (
  name,
  indication,
  description,
  duration,
  status,
  cost,
  key,
  worstOutcome
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE treatment 
      SET 
        NAME = ?, 
        INDICATION = ?, 
        DESCRIPTION = ?, 
        DURATION = ?, 
        COST = ?, 
        WORST_OUT_COME = ?, 
        STATUS = ?
      WHERE ID = ?`;

    db.query(
      sql,
      [
        name,
        indication,
        description,
        duration,
        cost,
        worstOutcome,
        status,
        key,
      ],
      (err, result) => {
        if (err) {
          reject({ message: err.message });
        } else {
          resolve({ message: "Data updated successfully!" });
        }
      }
    );
  });
};

// Function to get treatment data for the web
export const getWebTreamentDataService = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT NAME,DESCRIPTION,DURATION,WORST_OUT_COME,INDICATION FROM treatment WHERE STATUS = 1`;
    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};

//dd lsit 
export const ddlistService = async () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ID,NAME,DURATION,COST FROM treatment WHERE STATUS = 1'

    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  })
}
