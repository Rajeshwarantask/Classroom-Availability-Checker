const express = require('express');
const path = require("path");
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Import student routes and use them
// const studentsRouter = require("./routes/students"); // Add this line to import the student routes
// app.use("/api/students", studentsRouter);  // Add this to use the student routes at /api/students

const classroomsRouter = require("./routes/classrooms");
app.use("/api", classroomsRouter);

const dashboardRoutes = require("./routes/dashboard");
app.use("/api", dashboardRoutes);

const timetableRoutes = require('./routes/timetable');
app.use('/api/timetable', timetableRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
  });
}
// message 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



///"C:\Users\Lenovo\OneDrive\Desktop\classroom-availability-checker\frontend" npm start
///admin /// pass ///


// require('dotenv').config();
// console.log('dotenv loaded');
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(express.json());
// app.use(cors());
// const PORT = process.env.PORT || 5000;

// require('dotenv').config({ path: __dirname + '/.env' });
// console.log('MONGO_URI:', process.env.MONGO_URI);

// app.get('/api/classrooms', (req, res) => {
//     res.json([{ room: '701', status: 'Available' }]);
// });


// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

