const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['income', 'expense'], required: true },
  amount:   { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, trim: true },
  note:     { type: String, default: '', trim: true },
  date:     { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('Transaction', transactionSchema);