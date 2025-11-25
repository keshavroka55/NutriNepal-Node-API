// test.js
const mongoose = require('mongoose');
const User = require('./src/models/userModel'); // your model
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({});
    console.log(users);
    mongoose.disconnect();
  })
  .catch(console.error);
