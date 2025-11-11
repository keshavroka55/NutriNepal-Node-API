// models/UserLog.js
const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true }, // numeric quantity (units match food.serving_unit)
  unit: { type: String, default: 'g' },
  timestamp: { type: Date, default: Date.now },

  // optional stored totals (recommended)
  calories_kcal: { type: Number },
  protein_g: { type: Number },
  fat_g: { type: Number },
  carbs_g: { type: Number },
},{collection:'user_logs'}); // save foods logs in the main database collections.. 

module.exports = mongoose.model('UserLog', UserLogSchema);
