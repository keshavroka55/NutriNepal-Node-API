const UserProfile = require('../models/UserProfile');

exports.upsertProfile = async (req, res) => {
    try {
        const userId = req.user.id; // set by auth middleware
        const data = req.body;

        // basic defensive validation (you can use Joi or express-validator later)
        if (!data.name || !data.email) {
            return res.status(400).json({ message: 'name and email are required' });
        }

        // Build set object (only allow expected fields)
        const allowed = ['name', 'email', 'gender', 'age', 'height', 'weight', 'goal', 'activityLevel', 'dailyCalories', 'dailyProtein', 'dailyFat', 'dailyCarbs', 'lastSynced'];
        const set = {};
        for (const k of allowed) {
            if (k in data) set[k] = data[k];
        }
        // convert lastSynced to Date if provided
        if (set.lastSynced) set.lastSynced = new Date(set.lastSynced);

        // upsert: find profile by userId, update or create
        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            { $set: set, $setOnInsert: { userId } },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
