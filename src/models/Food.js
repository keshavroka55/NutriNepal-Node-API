// models/Food.js
const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name_en: { type: String, required: true, index: true },
  name_np: { type: String },
  serving_size: { type: Number, required: true },     // e.g., 100
  serving_unit: { type: String, default: 'g' },      // e.g., "g", "piece"
  calories_kcal: { type: Number, required: true },
  protein_g: { type: Number, default: 0 },
  fat_g: { type: Number, default: 0 },
  carbs_g: { type: Number, default: 0 },
  category: { type: String, index: true },
  source: { type: String },
  aliases: { type: [String], default: [] },
  updated_at: { type: Date, default: Date.now }},
  {collection:'foods'});  // collection name of NutriNepal database. 

module.exports = mongoose.model('Food', FoodSchema);
