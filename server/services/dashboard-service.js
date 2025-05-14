import { db } from "../env.js";

//get card data
export const getCardDataControllerService = async () => {
  return new Promise((resolve, reject) => {
    const thisMonthIncomeQuery = `
        SELECT SUM(PRICE) AS totalIncome 
        FROM appointment 
        WHERE PAYMENT_STATUS = 'completed' 
        AND MONTH(PAYMENT_DATE) = MONTH(CURRENT_DATE()) 
        AND YEAR(PAYMENT_DATE) = YEAR(CURRENT_DATE())
      `;

    const totalPendingPaymentQuery = `
        SELECT SUM(TOTAL_VALUE - PAID_VALUE) AS pendingAmount 
        FROM grn_request 
        WHERE PAYMENT_STATUS = 'Pending'
      `;

    const thisMonthExpenseQuery = `
        SELECT SUM(PAID_VALUE) AS totalExpense 
        FROM grn_request 
        WHERE PAYMENT_STATUS = 'Paid' 
        AND MONTH(DATE) = MONTH(CURRENT_DATE()) 
        AND YEAR(DATE) = YEAR(CURRENT_DATE())
      `;

    // Run all queries in parallel
    Promise.all([
      new Promise((res, rej) =>
        db.query(thisMonthIncomeQuery, (err, results) =>
          err ? rej(err) : res(results[0])
        )
      ),
      new Promise((res, rej) =>
        db.query(totalPendingPaymentQuery, (err, results) =>
          err ? rej(err) : res(results[0])
        )
      ),
      new Promise((res, rej) =>
        db.query(thisMonthExpenseQuery, (err, results) =>
          err ? rej(err) : res(results[0])
        )
      ),
    ])
      .then(([incomeResult, pendingResult, expenseResult]) => {
        resolve({
          thisMonthIncome: incomeResult.totalIncome || 0,
          totalPendingPayment: pendingResult.pendingAmount || 0,
          thisMonthExpense: expenseResult.totalExpense || 0,
        });
      })
      .catch((error) => {
        reject({ message: error.message });
      });
  });
};

//get monly appoinmrt count
export const getMonthlyAppoinmnetService = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        MONTH(\`DATE\`) AS month,
        COUNT(APPOINTMNET_ID)       AS count
      FROM appointment
      WHERE STATUS != 'cancelled'
        AND YEAR(\`DATE\`) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(\`DATE\`)
      ORDER BY MONTH(\`DATE\`)
    `;

    db.query(query, (error, results) => {
      if (error) {
        reject({ message: error.message });
        return;
      }

      // Ensure we have all 12 months, even if count = 0
      const countsByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0,
      }));

      results.forEach(({ month, count }) => {
        // month comes back as 1–12
        countsByMonth[month - 1].count = count;
      });

      resolve(countsByMonth);
    });
  });
};

//get monlty income 
export const getMonthlyIncomeService = async () => {
  return new Promise((resolve, reject) => {
    const incomeQuery = `
      SELECT 
        MONTH(PAYMENT_DATE) AS month, 
        SUM(PRICE) AS income 
      FROM appointment 
      WHERE PAYMENT_STATUS = 'completed' 
        AND YEAR(PAYMENT_DATE) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(PAYMENT_DATE)
      ORDER BY MONTH(PAYMENT_DATE)
    `;

    const expenseQuery = `
      SELECT 
        MONTH(DATE) AS month, 
        SUM(PAID_VALUE) AS expense 
      FROM grn_request 
      WHERE PAYMENT_STATUS = 'Paid' 
        AND YEAR(DATE) = YEAR(CURRENT_DATE())
      GROUP BY MONTH(DATE)
      ORDER BY MONTH(DATE)
    `;

    // Run both queries in parallel
    Promise.all([
      new Promise((res, rej) => db.query(incomeQuery, (err, results) => err ? rej(err) : res(results))),
      new Promise((res, rej) => db.query(expenseQuery, (err, results) => err ? rej(err) : res(results)))
    ])
    .then(([incomeResults, expenseResults]) => {
      // Initialize array with all 12 months
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        income: 0,
        expense: 0
      }));

      // Merge income
      incomeResults.forEach(({ month, income }) => {
        monthlyData[month - 1].income = income || 0;
      });

      // Merge expense
      expenseResults.forEach(({ month, expense }) => {
        monthlyData[month - 1].expense = expense || 0;
      });

      resolve(monthlyData);
    })
    .catch(error => {
      reject({ message: error.message });
    });
  });
};
