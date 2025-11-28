// routes/logs.js
const express = require('express');
const router = express.Router();
const {authenticateUser:auth} = require('../middleware/authMiddleware');
// const auth = require('../middleware/authMiddleware');  TypeError: argument handler must be a function
// the fucking error.. 
const UserLog = require('../models/UserLog');
const Food = require('../models/Food');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Create a log
router.post(
  '/add',
  auth,
  body('foodId').notEmpty(),
  body('quantity').isNumeric(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { foodId, quantity, unit } = req.body;
    if (!mongoose.Types.ObjectId.isValid(foodId)) return res.status(400).json({ error: 'Invalid foodId' });

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ error: 'Food not found' });

    const log = new UserLog({
      user: req.user._id,
      food: food._id,
      quantity,
      unit: unit || food.serving_unit
    });
    await log.save();
    res.json(await log.populate('food'));
  }
);

// Get user's logs (with food populated)
router.get('/users', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { user: req.user._id };
    if (from || to) filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);

    const logs = await UserLog.find(filter).populate('food').sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs', details: err.message });
  }
});

// Calculate totals for a user for a single day or date range
router.get('/totals', auth, async (req, res) => {
  // query params: date=YYYY-MM-DD or from=YYYY-MM-DD&to=YYYY-MM-DD
  const { date, from, to } = req.query;
  let start, end;
  if (date) {
    start = new Date(date);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  } else {
    start = from ? new Date(from) : new Date(0);
    end = to ? new Date(to) : new Date();
  }

  // fetch logs in range
  const logs = await UserLog.find({
    user: req.user._id,
    timestamp: { $gte: start, $lte: end }
  }).populate('food');

  // compute totals
  const totals = logs.reduce(
    (acc, log) => {
      const food = log.food;
      if (!food || !food.serving_size) return acc;
      const factor = log.quantity / food.serving_size;
      acc.calories += (food.calories_kcal || 0) * factor;
      acc.protein_g += (food.protein_g || 0) * factor;
      acc.fat_g += (food.fat_g || 0) * factor;
      acc.carbs_g += (food.carbs_g || 0) * factor;
      return acc;
    },
    { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
  );

  // round to reasonable decimals
  const round = (n) => Math.round(n * 100) / 100;
  res.json({
    totals: {
      calories_kcal: round(totals.calories),
      protein_g: round(totals.protein_g),
      fat_g: round(totals.fat_g),
      carbs_g: round(totals.carbs_g)
    },
    count: logs.length
  });
});

module.exports = router;
