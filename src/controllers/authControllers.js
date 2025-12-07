const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
// console.log("Loaded CONFIG from authControllers:", config);

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body; // big structuring. 

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists by email
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const allowedRoles = ["user", "admin", "superAdmin"];
    const userRole = allowedRoles.includes(req.body.role) ? req.body.role : "user";

    const user = new User({
      username,
      email,
      password,
      role: userRole
    });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });


    await user.save();

    res.status(201).json({ message: "User registered successfully", token, user});
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// controller functions for login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // console.log("JWT_SECRET:", config.JWT_SECRET);
    // console.log("JWT_EXPIRATION:", config.JWT_EXPIRATION);

    // console.log("TYPE OF SECRET:", typeof config.JWT_SECRET, "VALUE:", config.JWT_SECRET);


    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRATION,
    });


    // Exclude password before sending back user data
    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser, // optional, sends user data without password
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// controller functions to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// controller functions to delete a user by ID (optional enhancement) --- IGNORE ---
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
// export the controller functions
module.exports = { register, login, getAllUsers, deleteUser };





// authenticate - validate 
// authorization - determines what actions or resources that is permitted to access. 