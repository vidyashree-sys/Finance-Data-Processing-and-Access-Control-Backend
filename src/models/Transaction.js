const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { 
    type: Number,
     required: true 
    }, 

  type: { 
    type: String,
     enum: ['INCOME', 'EXPENSE'],
      required: true
     },

  category: {
     type: String, 
     required: true
     },

  description: {
     type: String 
    },

  date: {
     type: Date,
     default: Date.now
     },
     
  creator: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);