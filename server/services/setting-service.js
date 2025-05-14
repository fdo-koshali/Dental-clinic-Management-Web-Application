import { db } from "../env.js";

//add holidays
export const addHolidayService = async (date) => {
  return new Promise((resolve, reject) => {
    const query0 = "SELECT DATE FROM appointment WHERE DATE = ?";
    const query = "INSERT INTO holidays (DATE) VALUES (?)";

    db.query(query0, [date], (error, results) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          reject({ message: "Holiday already exists!" });
        } else {
          reject({ message: "Something went wrong, Please try again!" });
        }
      }
      if (results.length > 0) {
        return reject(new Error("Already Appointment on this date"));
      }
      db.query(query, [date], (error, results) => {
        if (error) {
          if (error.code === "ER_DUP_ENTRY") {
            reject({ message: "Holiday already exists!" });
          } else {
            reject({ message: "Something went wrong, Please try again!" });
          }
        }
        resolve({ message: "Holiday added successfully" });
      });
    });
  });
};

//get upcoming holidays
export const getUpcomingHolidaysService = async () => {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    const query = `SELECT DATE_FORMAT(DATE, '%Y-%m-%d') as DATE FROM holidays WHERE DATE >= '${today}' ORDER BY DATE ASC`;

    db.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

//delete holidays
export const deleteHolidayService = async (date) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM holidays WHERE DATE = ?";

    db.query(query, [date], (error, results) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
      } else if (results.affectedRows === 0) {
        reject({ message: "No holiday found for the given date" });
      } else {
        resolve({ message: "Holiday deleted successfully" });
      }
    });
  });
};

