const UserProfile = require('../models/UserProfile');
const { calculateMacros } = require('../utils/nutrition');

exports.upsertProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        // Basic validation
        if (!data.username || !data.email) {
            return res.status(400).json({ message: 'username and email are required' });
        }

        // Only allow permitted fields
        const allowed = [
            'username', 'email', 'gender', 'age', 'height', 'weight',
            'goal', 'activityLevel', 'lastSynced'
        ];

        const set = {};
        for (const k of allowed) {
            if (k in data) set[k] = data[k];
        }

        // Convert lastSynced if sent
        if (set.lastSynced) {
            set.lastSynced = new Date(set.lastSynced);
        }

        // ---------------- CALCULATE MACROS ---------------- //
        const hasAllMacroFields =
            set.gender &&
            set.age &&
            set.height &&
            set.weight &&
            set.goal &&
            set.activityLevel;

        if (hasAllMacroFields) {
            const macros = calculateMacros({
                gender: set.gender,
                age: set.age,
                height: set.height,
                weight: set.weight,
                goal: set.goal,
                activityLevel: set.activityLevel
            });

            set.dailyCalories = macros.dailyCalories;
            set.dailyProtein = macros.dailyProtein;
            set.dailyFat = macros.dailyFat;
            set.dailyCarbs = macros.dailyCarbs;
        }

        console.log("📌 Upsert payload:", set);

        // ---------------- UPSERT PROFILE ---------------- //
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $set: set, $setOnInsert: { userId } },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, profile });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await UserProfile.findOne({ userId });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json({ profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
