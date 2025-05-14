import e from "express";
import { db,EMAIL_USER, EMAIL_PASS } from "../env.js";
import nodemailer from 'nodemailer';

// get last item ID
export const getLastItemIDService = async (tname) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(ITEM_ID) AS ITEM_ID FROM item_data`;

    db.query(query, (err, result) => {
      if (err) {
        reject({ message: "Something went wrong, Please try again!" });
      } else {
        const code = result[0].ITEM_ID;
        let id;
        if (code) {
          const numberpart = parseInt(code.split("-")[1], 10);
          const newnumberpart = String(numberpart + 1).padStart(6, "0");
          id = `ITM-${newnumberpart}`;
        } else {
          id = `ITM-000001`;
        }
        resolve({ newid: id });
      }
    });
  });
};

// add item data
export const addItemDataService = async (
  code,
  name,
  description,
  status,
  unit
) => {
  return new Promise((resolve, reject) => {
    const query1 = `INSERT INTO stock (ITEM_ID,UPDATE_DATE,COUNT) VALUES (?, ?, ?)`;
    const query = `INSERT INTO item_data (ITEM_ID, ITEM_NAME, ITEM_DESCRIPTION, UNIT,STATUS) VALUES ('${code}', '${name}', '${description}', '${unit}', '${status}')`;

    db.query(query, (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          reject({ message: "Item code already exists!" });
        } else {
          reject({ message: "Something went wrong, Please try again!" });
        }
      } else {
        db.query(query1, [code, new Date(), 0], (err) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              reject({ message: "Item code already exists!" });
            } else {
              reject({ message: "Something went wrong, Please try again!" });
            }
          } else {
            resolve({ message: "Material data added successfully!" });
          }
        });
      }
    });
  });
};

// get item data
export const getItemDataService = async (page = 1, limit = 5, search = "") => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `%${search}%` : "%";

    const query = `
        SELECT * FROM item_data 
        WHERE ITEM_ID LIKE ? OR ITEM_NAME LIKE ?
        ORDER BY ITEM_ID DESC
        LIMIT ? OFFSET ?
      `;

    db.query(
      query,
      [searchQuery, searchQuery, parseInt(limit), parseInt(offset)],
      (err, result) => {
        if (err) {
          console.error("Search query error:", err);
          reject({ message: "Something went wrong, Please try again!" });
          return;
        }

        const countQuery = `
          SELECT COUNT(*) AS total FROM item_data 
          WHERE ITEM_ID LIKE ? OR ITEM_NAME LIKE ? OR ITEM_DESCRIPTION LIKE ?
        `;

        db.query(
          countQuery,
          [searchQuery, searchQuery, searchQuery],
          (err, count) => {
            if (err) {
              console.error("Count query error:", err);
              reject({ message: "Something went wrong, Please try again!" });
              return;
            }

            const total = count[0].total;
            const pages = Math.ceil(total / limit);

            resolve({
              data: result,
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: pages,
            });
          }
        );
      }
    );
  });
};

// edit item data
export const editItemDataService = async (
  code,
  name,
  description,
  status,
  unit
) => {
  return new Promise((resolve, reject) => {
    const query = `
  UPDATE item_data 
  SET ITEM_NAME = '${name}', ITEM_DESCRIPTION = '${description}', STATUS = '${status}', UNIT = '${unit}' 
  WHERE ITEM_ID = '${code}'
`;

    db.query(query, (err) => {
      if (err) {
        reject({ message: "Something went wrong, Please try again!" });
      } else {
        resolve({ message: "Item data updated successfully!" });
      }
    });
  });
};

// get item stock data
export const getItemStockService = async (searchQuery) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT item_data.ITEM_ID, item_data.ITEM_NAME,item_data.UNIT, DATE_FORMAT(stock.UPDATE_DATE, '%Y-%m-%d') as UPDATE_DATE, stock.COUNT 
        FROM item_data INNER JOIN stock ON item_data.ITEM_ID = stock.ITEM_ID`;

    if (searchQuery) {
      query += ` WHERE item_data.ITEM_ID LIKE '%${searchQuery}%' OR item_data.ITEM_NAME LIKE '%${searchQuery}%'`;
    }

    db.query(query, (err, result) => {
      if (err) {
        reject({ message: "Something went wrong, Please try again!" });
      } else {
        resolve(result);
      }
    });
  });
};

//get item dd list
export const getItemDDListService = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT ITEM_ID, ITEM_NAME,UNIT FROM item_data WHERE STATUS = 1`;
    db.query(sql, (err, result) => {
      if (err) {
        reject({ message: err.message });
      } else {
        resolve(result);
      }
    });
  });
};

//generate order id
export const generatOrderIdService = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT MAX(ORDER_ID) as ORDER_ID FROM grn_request`;
    db.query(query, (error, result) => {
      if (error) {
        reject({ message: "Something went wrong, Please try again!" });
        return;
      }
      let id;
      const ORDER_ID = result[0].ORDER_ID;
      if (ORDER_ID) {
        const numberpart = parseInt(ORDER_ID.split("-")[1], 10);
        const newnumberpart = String(numberpart + 1).padStart(6, "0");
        id = `ORD-${newnumberpart}`;
      } else {
        id = `ORD-000001`;
      }
      resolve({ newid: id });
    });
  });
};

const createOrderEmailTemplate = (orderId, items, totalValue) => {
  const itemsList = items.map(item => 
    `- ${item.itemName}: ${item.quantity} ${item.unit}`
  ).join('\n');

  return `
    Dear Supplier,

    A new order request has been created with the following details:

    Order ID: ${orderId}
    Total Value: Rs.${totalValue}

    Items Requested:
    ${itemsList}

    Please review and process this order at your earliest convenience.

    Best regards,
    Dental Clinic Management System
  `;
};

// add request order data
export const addRequestOrderDataService = async (orderId, supplier, totalValue, items) => {
  return new Promise((resolve, reject) => {
    const query0 = 'SELECT EMAIL FROM users WHERE USER_ID = ?';
    const query1 = `INSERT INTO grn_request (ORDER_ID, DATE, TOTAL_VALUE, PAYMENT_STATUS, SUPPEIR_ID, ORDER_STATUS) VALUES (?, ?, ?, ?, ?, ?)`;
    const query2 = 'INSERT INTO grn_request_items (ORDER_ID, ITEM_ID, QUANTITY) VALUES ?';

    // First get supplier email
    db.query(query0, [supplier], async (err, result) => {
      if (err) {
        reject({ message: "Error fetching supplier email" });
        return;
      }

      const supplierEmail = result[0]?.EMAIL;
      if (!supplierEmail) {
        reject({ message: "Supplier email not found" });
        return;
      }

      // Configure email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Send email
      try {
        await transporter.sendMail({
          from: EMAIL_USER,
          to: supplierEmail,
          subject: `New Order Request - ${orderId}`,
          text: createOrderEmailTemplate(orderId, items, totalValue)
        });

        // Proceed with database operations
        db.query(
          query1,
          [orderId, new Date(), totalValue, 'Pending', supplier, 'Processing'],
          (err) => {
            if (err) {
              reject({ message: err.message });
              return;
            }

            const values = items.map((item) => [
              orderId,
              item.itemId,
              item.quantity,
            ]);

            db.query(query2, [values], (err) => {
              if (err) {
                reject({ message: err.message });
              } else {
                resolve({ 
                  message: "Request order data added and email sent successfully!" 
                });
              }
            });
          }
        );
      } catch (emailErr) {
        reject({ message: "Something went wrong, Pleasle try again" });
      }
    });
  });
};

// get item request data
export const getRequestOrderDataService = async (page = 1, limit = 5, search = "") => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `%${search}%` : "%";

    const query = `
        SELECT 
          grn_request.ORDER_ID, 
          DATE_FORMAT(grn_request.DATE, '%Y-%m-%d') as DATE, 
          grn_request.TOTAL_VALUE,
          grn_request.PAID_VALUE, 
          grn_request.PAYMENT_STATUS, 
          grn_request.ORDER_STATUS, 
          users.FIRST_NAME, 
          users.LAST_NAME,
          CONCAT('[', GROUP_CONCAT(
            JSON_OBJECT(
              'itemId', item_data.ITEM_ID,
              'itemName', item_data.ITEM_NAME,
              'unit', item_data.UNIT,
              'quantity', grn_request_items.QUANTITY
            )
          ), ']') as orderDetails
        FROM grn_request
        INNER JOIN users ON grn_request.SUPPEIR_ID = users.USER_ID
        INNER JOIN grn_request_items ON grn_request.ORDER_ID = grn_request_items.ORDER_ID
        INNER JOIN item_data ON grn_request_items.ITEM_ID = item_data.ITEM_ID
        WHERE grn_request.ORDER_ID LIKE ? OR users.FIRST_NAME LIKE ? OR users.LAST_NAME LIKE ?
        GROUP BY grn_request.ORDER_ID
        ORDER BY grn_request.ORDER_ID DESC
        LIMIT ? OFFSET ?
      `;

    db.query(
      query,
      [searchQuery, searchQuery, searchQuery, parseInt(limit), parseInt(offset)],
      (err, result) => {
        if (err) {
          console.error("Search query error:", err);
          reject({ message: err.message });
          return;
        }

        // Process the results to parse JSON string
        const processedResult = result.map(row => ({
          ...row,
          orderDetails: JSON.parse(row.orderDetails || '[]')
        }));

        const countQuery = `
          SELECT COUNT(*) AS total FROM grn_request 
          INNER JOIN users ON grn_request.SUPPEIR_ID = users.USER_ID
          WHERE grn_request.ORDER_ID LIKE ? OR users.FIRST_NAME LIKE ? OR users.LAST_NAME LIKE ?
        `;

        db.query(
          countQuery,
          [searchQuery, searchQuery, searchQuery],
          (err, count) => {
            if (err) {
              console.error("Count query error:", err);
              reject({ message: err.message });
              return;
            }

            const total = count[0].total;
            const pages = Math.ceil(total / limit);

            resolve({
              data: processedResult,
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: pages,
            });
          }
        );
      }
    );
  });
};

// edit request order data
export const editRequestDataService = async (orderId, orderStatus, paymentAmount, paymentStatus) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE grn_request 
      SET PAYMENT_STATUS = ?, 
          PAID_VALUE = PAID_VALUE + ?, 
          ORDER_STATUS = ?
      WHERE ORDER_ID = ?
    `;

    const values = [paymentStatus, paymentAmount, orderStatus, orderId];

    db.query(query, values, (err) => {
      if (err) {
        reject({ message: "Something went wrong, please try again!" });
      } else {
        resolve({ message: "Request order data updated successfully!" });
      }
    });
  });
};

// add grn data
export const addGrnDataService = async (itemId, quantity, receivedDate) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO grn (ITEM_ID, RECEIVED_DATE, QUANTITY) VALUES (?, ?, ?)`;
    const query1 = `UPDATE stock SET COUNT = COUNT + ? ,UPDATE_DATE = ? WHERE ITEM_ID = ?`;

    db.query(query, [itemId,receivedDate,quantity], (err) => {
      if (err) {
        reject({ message: "Something went wrong, please try again!" });
      } else {
        db.query(query1, [quantity, new Date(), itemId], (err) => {
          if (err) {
            reject({ message: "Something went wrong, please try again!" });
          } else {
            resolve({ message: "Grn data added successfully!" });
          }
        });
      }
    });
  });
};

// get grn data
export const getGrnDataService = async (page = 1, limit = 5) => {
  return new Promise((resolve, reject) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT item_data.ITEM_ID, 
             DATE_FORMAT(grn.RECEIVED_DATE, '%Y-%m-%d') as RECEIVED_DATE, 
             grn.QUANTITY, 
             item_data.UNIT, 
             item_data.ITEM_NAME
      FROM grn
      INNER JOIN item_data ON grn.ITEM_ID = item_data.ITEM_ID
      ORDER BY grn.RECEIVED_DATE DESC
      LIMIT ? OFFSET ?
    `;

    db.query(
      query,
      [limitNum, offset],
      (err, result) => {
        if (err) {
          console.error("Search query error:", err);
          reject({ message: "Something went wrong, Please try again!" });
          return;
        }

        const countQuery = `
          SELECT COUNT(*) AS total 
          FROM grn 
          INNER JOIN item_data ON grn.ITEM_ID = item_data.ITEM_ID 
        `;

        db.query(
          countQuery,
          (err, count) => {
            if (err) {
              console.error("Count query error:", err);
              reject({ message: "Something went wrong, Please try again!" });
              return;
            }

            const total = count[0].total;
            const totalPages = Math.ceil(total / limitNum);

            resolve({
              data: result,
              total,
              page: pageNum,
              limit: limitNum,
              totalPages,
            });
          }
        );
      }
    );
  });
};

