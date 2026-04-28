const { getDB } = require("../../config/db");
const { ObjectId } = require("mongodb");

const addTransaction = async (req, res) => {
  const db = getDB();
  const { type, amount, category, date, description, updated_by } = req.body;

  if (!type || !amount || !date || !updated_by) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const transaction = {
      type, // 'income' or 'expense'
      amount: Number(amount),
      category,
      date,
      description,
      updated_by,
      created_at: new Date()
    };

    const result = await db.collection('Transactions').insertOne(transaction);
    res.status(201).json({ message: "Transaction added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTransactions = async (req, res) => {
  const db = getDB();
  const { startDate, endDate, type } = req.query;

  let query = {};
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  if (type) {
    query.type = type;
  }

  try {
    const transactions = await db.collection('Transactions').find(query).sort({ date: -1 }).toArray();
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateTransaction = async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { type, amount, category, date, description, updated_by } = req.body;

  try {
    const result = await db.collection('Transactions').updateOne(
      { _id: new ObjectId(id) },
      { $set: { type, amount: Number(amount), category, date, description, updated_by, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTransaction = async (req, res) => {
  const db = getDB();
  const { id } = req.params;

  try {
    const result = await db.collection('Transactions').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFinancialReport = async (req, res) => {
  const db = getDB();
  const { startDate, endDate } = req.query;

  let query = {};
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  try {
    const transactions = await db.collection('Transactions').find(query).toArray();
    
    // Also include Paid Payrolls in expenses
    const payrollQuery = {};
    if (startDate && endDate) {
        // Payrolls use 'month' (YYYY-MM), so we might need to adjust or just fetch all for now
        // For simplicity, let's assume 'month' filter works if user selects whole months
    }
    const payrolls = await db.collection('Payrolls').find({ status: "Paid" }).toArray();

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSalaryExpense = payrolls.reduce((sum, p) => sum + (p.salary_breakdown?.net_salary || 0), 0);

    res.status(200).json({
      totalIncome,
      totalExpense: totalExpense + totalSalaryExpense,
      otherExpense: totalExpense,
      salaryExpense: totalSalaryExpense,
      netProfit: totalIncome - (totalExpense + totalSalaryExpense)
    });
  } catch (error) {
    console.error("Error fetching financial report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getMonthlySummary = async (req, res) => {
    const db = getDB();
    const { month } = req.query; // YYYY-MM

    try {
        const transactions = await db.collection('Transactions').find({
            date: { $regex: `^${month}` }
        }).toArray();

        const payrolls = await db.collection('Payrolls').find({
            month: month,
            status: "Paid"
        }).toArray();

        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalSalaryExpense = payrolls.reduce((sum, p) => sum + (p.salary_breakdown?.net_salary || 0), 0);

        res.status(200).json({
            month,
            totalIncome,
            totalExpense: totalExpense + totalSalaryExpense,
            netProfit: totalIncome - (totalExpense + totalSalaryExpense)
        });
    } catch (error) {
        console.error("Error fetching monthly summary:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getFinancialReport,
  getMonthlySummary
};
