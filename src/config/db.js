const mongoose = require("mongoose");
const config = require("./config");
const db = {};
db.connect = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
db.disconnect = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection failed:", error);
  }
};  
module.exports = db;
// This file handles the connection to the MongoDB database using Mongoose.
// It exports an object with connect and disconnect methods for managing the database connection.