const Transaction = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    const transaction = await Transaction.create({
      amount, // Reminder: Input should be in cents (1000 = $10.00)
      type,
      category,
      description,
      date,
      creator: req.user._id // Taken from the protect middleware
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Invalid transaction data', error: error.message });
  }
};

// @desc    Get all transactions (with Filtering)
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = {};

    // Filtering Logic (Requirement #2)
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

// @desc    Get Dashboard Summary
// @route   GET /api/transactions/summary
const getSummary = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] }
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] }
          },
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] }
        }
      }
    ]);

    // Category-wise breakdown
    const categoryStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          type: { $first: "$type" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      summary: stats[0] || { totalIncome: 0, totalExpenses: 0, netBalance: 0 },
      categories: categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating summary', error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
 