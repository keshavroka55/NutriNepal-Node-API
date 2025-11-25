const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true, lowercase: true },

    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    age: { type: Number, min: 0 },

    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg

    goal: { type: String, enum: ['lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle', 'other'] },

    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'light' },

    dailyCalories: { type: Number },
    dailyProtein: { type: Number }, // grams
    dailyFat: { type: Number },     // grams
    dailyCarbs: { type: Number },   // grams

    lastSynced: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
