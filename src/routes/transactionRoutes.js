const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction,
  getSummary
} = require('../controllers/transactionController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// All transaction routes require login
router.use(protect);

// 1. Dashboard Summary (Accessible by Admin and Analyst)
router.get('/summary', authorize('ADMIN', 'ANALYST'), getSummary);

// GET is allowed for everyone (Admin, Analyst, Viewer)
router.get('/', getTransactions);

// POST, PUT, DELETE are restricted to ADMIN only (Requirement #4)
router.post('/', authorize('ADMIN'), createTransaction);
router.put('/:id', authorize('ADMIN'), updateTransaction);
router.delete('/:id', authorize('ADMIN'), deleteTransaction);

module.exports = router;