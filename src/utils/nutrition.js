// controllers/profileController.js
const UserProfile = require('../models/UserProfile');

// Helper: calculate macros and calories
function calculateMacros({ gender = 'prefer_not_to_say', age = 30, height = 170, weight = 70, goal = 'maintain', activityLevel = 'light' }) {
    // 1) BMR (Mifflin-St Jeor)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age; // gender neutral fallback
    }

    // 2) activity multiplier
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };
    const multiplier = multipliers[activityLevel] ?? multipliers.light;
    let calories = Math.round(bmr * multiplier);

    // 3) goal adjustment
    if (goal === 'lose_weight') calories -= 500;
    if (goal === 'gain_weight') calories += 500;
    if (calories < 1000) calories = 1000; // safety clamp

    // 4) macros (simple approach)
    const proteinG = Math.round(1.8 * weight);        // g protein per day
    const fatG = Math.round(0.8 * weight);            // g fat per day
    const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);

    return {
        dailyCalories: calories,
        dailyProtein: Math.max(0, proteinG),
        dailyFat: Math.max(0, fatG),
        dailyCarbs: Math.max(0, carbsG),
    };
}


module.exports = { calculateMacros };
