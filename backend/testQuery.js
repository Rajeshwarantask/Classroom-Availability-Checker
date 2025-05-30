// testQuery.js
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Classroom = require('./models/Classroom');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
  .then(async () => {
    console.log('Connected to MongoDB');
    const room = await Classroom.findOne({ room_number: "704" });
    console.log("Found classroom:", room);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
