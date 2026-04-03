const Transaction = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    // 1. Manual Validation (Requirement #5)
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid positive amount' });
    }
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either INCOME or EXPENSE' });
    }
    if (!category || category.trim() === "") {
      return res.status(400).json({ message: 'Category is required' });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      description,
      date: date || Date.now(),
      creator: req.user._id
    });

    res.status(201).json(transaction);
  } catch (error) {
    // This passes the error to our Global Error Handler
    res.status(500);
    throw new Error('Server Error: Could not create transaction');
  }
};

// @desc    Get all transactions (with Filtering)
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    // 1. Extract values from the URL (Query Parameters)
    // Example: /api/transactions?page=1&limit=5&search=Lunch
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, type, category } = req.query;

    // 2. Build the Query (The "Filter")
    // We only want records where isDeleted is NOT true
    let query = { isDeleted: { $ne: true } };

    // Filter by Type (INCOME/EXPENSE)
    if (type) {
      query.type = type;
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // SEARCH LOGIC: Look inside Description OR Category
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Get Data from MongoDB
    const transactions = await Transaction.find(query)
      .sort({ date: -1 }) // Show newest records first
      .limit(limit)
      .skip(skip);

    // 4. Get Total Count (Needed for frontend pagination buttons)
    const totalRecords = await Transaction.countDocuments(query);

    // 5. Send Response
    res.json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
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
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Change the flag instead of removing the document
    transaction.isDeleted = true;
    await transaction.save();

    res.json({ message: 'Transaction moved to trash (Soft Deleted)' });
  } catch (error) {
    res.status(500).json({ message: 'Error during soft delete' });
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
 