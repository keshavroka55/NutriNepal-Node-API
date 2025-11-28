const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const {authenticateUser} = require('../middleware/authMiddleware'); // JWT auth middleware

// Create or update profile (user must be authenticated)
router.post('/profile', authenticateUser, profileController.upsertProfile);
router.put('/profile', authenticateUser, profileController.upsertProfile);
router.get('/profile', authenticateUser, profileController.getProfile);

module.exports = router;
