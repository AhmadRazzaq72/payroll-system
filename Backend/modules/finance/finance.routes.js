const express = require("express");
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getFinancialReport,
  getMonthlySummary
} = require("./finance.controller");

const router = express.Router();

router.post("/transactions", addTransaction);
router.get("/transactions", getTransactions);
router.put("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);
router.get("/reports/financial", getFinancialReport);
router.get("/reports/monthly", getMonthlySummary);

module.exports = router;
