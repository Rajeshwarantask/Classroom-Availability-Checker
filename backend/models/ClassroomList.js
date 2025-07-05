const mongoose = require("mongoose");

const ClassroomListSchema = new mongoose.Schema({
  classrooms: { type: [String], required: true }
});

module.exports = mongoose.model("ClassroomList", ClassroomListSchema);
