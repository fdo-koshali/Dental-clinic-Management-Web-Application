import { db } from "../env.js";

//generate user id
export const generateIdService = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(APPOINTMNET_ID) as APPOINTMNET_ID FROM appointment`;
    db.query(query, (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      let id;
      const APPOINTMNET_ID = result[0].APPOINTMNET_ID;
      if (APPOINTMNET_ID) {
        const numberpart = parseInt(APPOINTMNET_ID.split("-")[1], 10);
        const newnumberpart = String(numberpart + 1).padStart(6, "0");
        id = `APT-${newnumberpart}`;
      } else {
        id = `APT-000001`;
      }
      resolve({ newid: id });
    });
  });
};

//find time slot
export const findTimeSlotService = (duration, date, timePreference) => {
  return new Promise((resolve, reject) => {
    const preferenceWindows = {
      morning: { start: "09:00:00", end: "12:00:00" },
      afternoon: { start: "14:00:00", end: "17:00:00" },
      evening: { start: "18:00:00", end: "20:00:00" },
    };

    const { start: prefStart, end: prefEnd } =
      preferenceWindows[timePreference] || {};
    if (!prefStart || !prefEnd) {
      reject({ message: "Invalid time preference." });
      return;
    }

    const query = `
      SELECT END_TIME 
      FROM appointment 
      WHERE DATE = ?
      ORDER BY END_TIME DESC 
      LIMIT 1
    `;

    db.query(query, [date, timePreference], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }

      // If no appointments, start from preference start time
      let nextStartTime = prefStart;
      if (result.length > 0 && result[0].END_TIME > prefStart) {
        nextStartTime = result[0].END_TIME;
      }

      // Compute proposed end time
      const [h, m, s] = nextStartTime.split(":").map(Number);
      const startDate = new Date(`1970-01-01T${nextStartTime}`);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const proposedEndTime = endDate.toTimeString().split(" ")[0]; // HH:MM:SS

      // Check if proposed end time is within the preference window
      if (proposedEndTime <= prefEnd) {
        resolve({
          message: "Time slot is available",
          start_time: nextStartTime,
          end_time: proposedEndTime,
        });
      } else {
        resolve({ message: "No time slot available" });
      }
    });
  });
};

//create appointment
export const createAppointmentService = (
  appointmentId,
  charges,
  date,
  doctorId,
  endTime,
  patientId,
  startTime,
  treatmentId
) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO appointment (APPOINTMNET_ID, TREATMENT_ID, DOCTOR_ID, PATIENT_ID, DATE, START_TIME, END_TIME, PRICE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(
      query,
      [
        appointmentId,
        treatmentId,
        doctorId,
        patientId,
        date,
        startTime,
        endTime,
        charges,
      ],
      (error, result) => {
        if (error) {
          reject({ message: error.message });
          return;
        }
        resolve({ message: "Appointment created successfully" });
      }
    );
  });
};

//get upcoming appointments data
export const getUpcommingDataService = (userId, relatedIds) => {
  return new Promise((resolve, reject) => {
    if (!userId || !Array.isArray(relatedIds)) {
      reject({ message: "Invalid userId or relatedIds" });
      return;
    }

    // Combine userId with relatedIds for patient filtering
    const allIds = [userId, ...relatedIds];

    const query = `
      SELECT 
        a.APPOINTMNET_ID,
        DATE_FORMAT(a.DATE, '%Y-%m-%d') AS DATE,
        a.START_TIME,
        a.END_TIME,
        a.PRICE,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) AS DOCTOR_NAME,
        CONCAT(p.FIRST_NAME, ' ', p.LAST_NAME) AS PATIENT_NAME,
        a.STATUS
      FROM appointment a
      JOIN users u ON a.DOCTOR_ID = u.USER_ID
      JOIN users p ON a.PATIENT_ID = p.USER_ID
      WHERE a.PATIENT_ID IN (?) AND a.DATE >= CURDATE()
      ORDER BY a.DATE ASC
    `;

    db.query(query, [allIds], (error, result) => {
      if (error) {
        reject({ message: "Database query failed", error });
        return;
      }
      resolve(result);
    });
  });
};

//change appointment status
export const changeAppoinmnetStatusService = (appointmentId, status) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE appointment SET STATUS = ? WHERE APPOINTMNET_ID = ?`;
    db.query(query, [status, appointmentId], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }
      resolve({ message: "Appointment status updated successfully" });
    });
  });
};

//get today appointment data
export const getTodayDataService = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        a.APPOINTMNET_ID,
        DATE_FORMAT(a.DATE, '%Y-%m-%d') AS DATE,
        a.START_TIME,
        a.END_TIME,
        a.PRICE,
        a.DOCTOR_UPDATE,
        a.PAYMENT_STATUS,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) AS DOCTOR_NAME,
        CONCAT(p.FIRST_NAME, ' ', p.LAST_NAME) AS PATIENT_NAME,
        a.STATUS
      FROM appointment a
      JOIN users u ON a.DOCTOR_ID = u.USER_ID
      JOIN users p ON a.PATIENT_ID = p.USER_ID
      WHERE a.DATE = CURDATE() AND a.PAYMENT_STATUS != 'completed'
      ORDER BY a.START_TIME ASC
    `;

    db.query(query, (error, result) => {
      if (error) {
        console.error("Database query error:", error);
        reject({ message: "Database query failed", error });
        return;
      }
      resolve(result);
    });
  });
};

//update charges and notes
export const updateChargesService = (
  additionalCharges,
  appointmentId,
  doctorNote
) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE appointment SET PRICE = PRICE + ?, DOCTOR_UPDATE = ? WHERE APPOINTMNET_ID = ?`;
    db.query(
      query,
      [additionalCharges, doctorNote, appointmentId],
      (error, result) => {
        if (error) {
          reject({ message: error.message });
          return;
        }
        resolve({ message: "Appointment updated successfully" });
      }
    );
  });
};

//change payment status
export const changePaymnetStatusService = (appointmentId, paymentStatus) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE appointment 
      SET PAYMENT_STATUS = ?, PAYMENT_DATE = NOW() 
      WHERE APPOINTMNET_ID = ?
    `;

    db.query(query, [paymentStatus, appointmentId], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }
      resolve({ message: "Payment status updated successfully" });
    });
  });
};

//add items to patient
export const addItemsToPatientService = (appointmentId, itemId, quantity) => {
  return new Promise((resolve, reject) => {
    const query0 =
      "UPDATE stock SET COUNT = COUNT - ?,UPDATE_DATE = NOW()   WHERE ITEM_ID = ?";
    const query = `INSERT INTO treatment_medicine (APPOINTMNET_ID, ITEM_ID,COUNT) VALUES (?, ? , ?)`;

    db.query(query, [appointmentId, itemId, quantity], (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          reject({ message: "Data already exists!" });
        } else {
          reject({ message: error.message });
        }
      }
      db.query(query0, [quantity, itemId], (error, result) => {
        if (error) {
          reject({ message: error.message });
          return;
        }
        resolve({ message: "Items added to patient successfully" });
      });
    });
  });
};

//get appointment item data
export const getAppoinmnetItemDataService = (appointmentId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        i.ITEM_ID,
        tm.COUNT,
        i.ITEM_NAME,
        i.UNIT
      FROM treatment_medicine tm
      JOIN item_data i ON tm.ITEM_ID = i.ITEM_ID
      WHERE tm.APPOINTMNET_ID = ?
    `;

    db.query(query, [appointmentId], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }
      resolve(result);
    });
  });
};

//delete appointment item data
export const deleteAppoinmnetItemDataService = (
  appointmentId,
  itemId,
  quantity
) => {
  return new Promise((resolve, reject) => {
    const query0 =
      "UPDATE stock SET COUNT = COUNT + ?,UPDATE_DATE = NOW()   WHERE ITEM_ID = ?";
    const query = `DELETE FROM treatment_medicine WHERE APPOINTMNET_ID = ? AND ITEM_ID = ?`;

    db.query(query, [appointmentId, itemId], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }
      db.query(query0, [quantity, itemId], (error, result) => {
        if (error) {
          reject({ message: error.message });
          return;
        }
        resolve({ message: "Items deleted from patient successfully" });
      });
    });
  });
};

//get past appointment data
export const getPastDataService = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        a.APPOINTMNET_ID,
        DATE_FORMAT(a.DATE, '%Y-%m-%d') AS DATE,
        a.START_TIME,
        a.END_TIME,
        a.PRICE,
        a.DOCTOR_UPDATE,
        a.PAYMENT_STATUS,
        CONCAT(u.FIRST_NAME, ' ', u.LAST_NAME) AS DOCTOR_NAME,
        CONCAT(p.FIRST_NAME, ' ', p.LAST_NAME) AS PATIENT_NAME,
        i.ITEM_ID,
        tm.COUNT,
        i.ITEM_NAME,
        i.UNIT,
        a.STATUS
      FROM appointment a
      JOIN users u ON a.DOCTOR_ID = u.USER_ID
      JOIN users p ON a.PATIENT_ID = p.USER_ID
      JOIN treatment_medicine tm ON a.APPOINTMNET_ID = tm.APPOINTMNET_ID
      JOIN item_data i ON tm.ITEM_ID = i.ITEM_ID
      WHERE a.PATIENT_ID = ? AND a.PAYMENT_STATUS = 'completed'
      ORDER BY a.START_TIME ASC
    `;

    db.query(query, [userId], (error, result) => {
      if (error) {
        reject({ message: error.message });
        return;
      }

      // Group data by APPOINTMNET_ID
      const grouped = {};
      result.forEach(row => {
        const id = row.APPOINTMNET_ID;

        if (!grouped[id]) {
          grouped[id] = {
            APPOINTMNET_ID: row.APPOINTMNET_ID,
            DATE: row.DATE,
            START_TIME: row.START_TIME,
            END_TIME: row.END_TIME,
            PRICE: row.PRICE,
            DOCTOR_UPDATE: row.DOCTOR_UPDATE,
            PAYMENT_STATUS: row.PAYMENT_STATUS,
            DOCTOR_NAME: row.DOCTOR_NAME,
            PATIENT_NAME: row.PATIENT_NAME,
            STATUS: row.STATUS,
            ITEMS: [], // Hold medicine items
          };
        }

        grouped[id].ITEMS.push({
          ITEM_ID: row.ITEM_ID,
          ITEM_NAME: row.ITEM_NAME,
          COUNT: row.COUNT,
          UNIT: row.UNIT
        });
      });

      // Convert grouped object to array
      resolve(Object.values(grouped));
    });
  });
};

