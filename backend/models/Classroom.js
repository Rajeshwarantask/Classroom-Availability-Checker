const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  subjects: { type: [String], required: true }
});

const PeriodSchema = new mongoose.Schema({
  period: { type: Number, required: true },
  facultyId: { type: String },
  occupied: { type: Boolean, default: false },
  room: { type: String },
  subject: { type: String },
  projector: { type: Boolean, default: false }
});

const ScheduleSchema = new mongoose.Schema({
  Monday: { type: [PeriodSchema], default: [] },
  Tuesday: { type: [PeriodSchema], default: [] },
  Wednesday: { type: [PeriodSchema], default: [] },
  Thursday: { type: [PeriodSchema], default: [] },
  Friday: { type: [PeriodSchema], default: [] },
  Saturday: { type: [PeriodSchema], default: [] }
});

const ClassroomSchema = new mongoose.Schema({
  room_number: { type: String, required: true }, // add top-level room_number for ease of query
  year: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: [FacultySchema], required: true },
  schedule: { type: ScheduleSchema, required: true }
});

module.exports = mongoose.model("Classroom", ClassroomSchema);