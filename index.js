const express = require('express'); // web framwork for handle http request and response. it is a nodejs framework. 
const config = require("./src/config/config");
const db = require("./src/config/db");
const cors = require('cors');

// while the error of jwt_secret logic one 
require('dotenv').config();


// import routes
const authRoutes = require('./src/Routes/authRoute');
const userRoutes = require("./src/Routes/userRoute");

// food routes
const foodRoutes = require("./src/Routes/foodRoutes");
const logRoutes = require("./src/Routes/logRoutes"); 


const app = express();
// allow all the origin (only for developement to run on browwer.. )
app.use(cors());

app.use(express.json());

// Connect to the database
db.connect();

// routers
app.use("/api/auth/v1", authRoutes);
app.use("/api/v1/users", userRoutes);

//register route 
app.use('/api/foods',foodRoutes);
app.use('/api/logs',logRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = db;


