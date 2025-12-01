const express = require('express'); // web framwork for handle http request and response. it is a nodejs framework. 
const config = require("./src/config/config");
const db = require("./src/config/db");
const cors = require('cors');
const bodyParser = require('body-parser');

// while the error of jwt_secret logic one 
require('dotenv').config();


// import routes
const authRoutes = require('./src/Routes/authRoute');
const userRoutes = require("./src/Routes/userRoute");

// food routes
const foodRoutes = require("./src/Routes/foodRoutes");
const logRoutes = require("./src/Routes/logRoutes"); 

//profiles routes 
const profileRoutes = require('./src/Routes/profile');



const app = express();
// allow all the origin (only for developement to run on browwer.. )
app.use(cors());

app.use(bodyParser.json());

// Connect to the database
db.connect();

// routers
app.use("/api/auth/v1", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use('/api/foods',foodRoutes);
app.use('/api/logs',logRoutes);

// user profile 
app.use('/api/v1/user', profileRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => 
    console.log(`Server running on port http://0.0.0.0:${PORT}`));

module.exports = db;


