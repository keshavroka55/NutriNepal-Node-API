
const dotenv = require('dotenv');
dotenv.config();
const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI:process.env.MONGODB_URI || "mongodb://localhost:27017/NutriNepalBackendAPI",
  JWT_SECRET: process.env.JWT_SECRET ,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION ,
};

// console.log("CONFIG VALUES LOADED:", config); 

module.exports = config;

