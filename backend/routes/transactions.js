const router  = require('express').Router();
const protect = require('../middleware/auth');
const Transaction = require('../models/Transaction');
router.use(protect);

// GET /api/transactions?type=&category=&from=&to=
router.get('/', async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }
    const txns = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(txns);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/transactions/summary
router.get('/summary', async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user._id });
    const income  = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expense = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const balance = income - expense;

    // Group by category for expenses
    const byCategory = {};
    txns.filter(t=>t.type==='expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category]||0) + t.amount;
    });

    // Group by month for trend
    const byMonth = {};
    txns.forEach(t => {
      const key = new Date(t.date).toLocaleDateString('en-US',{month:'short',year:'2-digit'});
      if (!byMonth[key]) byMonth[key] = { month:key, income:0, expense:0 };
      byMonth[key][t.type] += t.amount;
    });

    res.json({
      income, expense, balance,
      byCategory: Object.entries(byCategory).map(([category,amount])=>({category,amount})),
      byMonth: Object.values(byMonth),
      count: txns.length,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    if (!type || !amount || !category) return res.status(400).json({ message: 'Type, amount and category are required' });
    const txn = await Transaction.create({ user: req.user._id, type, amount, category, note, date: date||Date.now() });
    res.status(201).json(txn);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    Object.assign(txn, req.body);
    await txn.save();
    res.json(txn);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;