
// Routes for food-related API endpoints

// routes/foods.js
const express = require('express');
const router = express.Router();
const {authenticateUser:auth} = require('../middleware/authMiddleware');
const Food = require('../models/Food');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Create food (admin only)
router.post(
  '/add',
  auth,
  body('name_en').notEmpty(),
  body('serving_size').isNumeric(),
  body('calories_kcal').isNumeric(),
  async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = req.body;
    try {
      const food = new Food(payload);
      await food.save();
      res.json(food);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create food', details: err.message });
    }
  }
);

// List foods (search q, category, pagination)
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 30, category } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name_en: new RegExp(q, 'i') }, { name_np: new RegExp(q, 'i') }, { aliases: new RegExp(q, 'i') }];
    if (category) filter.category = category;

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
    const foods = await Food.find(filter).skip(skip).limit(Math.max(1, parseInt(limit))).sort({ name_en: 1 });
    const total = await Food.countDocuments(filter);
    res.json({ data: foods, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch foods', details: err.message });
  }
});

// Get single food
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const f = await Food.findById(req.params.id);
  if (!f) return res.status(404).json({ error: 'Food not found' });
  res.json(f);
});

// Update (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const updated = await Food.findByIdAndUpdate(req.params.id, { ...req.body, updated_at: Date.now() }, { new: true });
  res.json(updated);
});

// Delete (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  await Food.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
