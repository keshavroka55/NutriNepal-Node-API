const express = require("express");
const { login, register } = require("../controllers/authControllers");
const   router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);



module.exports = router;