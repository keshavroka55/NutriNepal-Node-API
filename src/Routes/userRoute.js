const express = require("express");
const { get } = require("mongoose");
const { getAllUsers, deleteUser } = require("../controllers/authControllers");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

/**
 * @description get all users
 * @api GET /api/v1/users
 * @access Public
 * @type GET
 * @returns response
 */
router.get("/all", authenticateUser, getAllUsers);

/**
 * @description delete a user by ID (optional enhancement)
 * @api DELETE /api/v1/users/:userId
 * @access Private
 * @type DELETE
 * @returns response
 */
router.delete("/:userId", authenticateUser, authorizeRoles("admin"), deleteUser);

module.exports = router;