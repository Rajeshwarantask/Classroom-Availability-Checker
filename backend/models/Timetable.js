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
  subject: { type: String }
});

const ScheduleSchema = new mongoose.Schema({
  Monday: { type: [PeriodSchema], default: [] },
  Tuesday: { type: [PeriodSchema], default: [] },
  Wednesday: { type: [PeriodSchema], default: [] },
  Thursday: { type: [PeriodSchema], default: [] },
  Friday: { type: [PeriodSchema], default: [] }
});

const TimetableSchema = new mongoose.Schema({
  year: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: [FacultySchema], required: true },
  schedule: { type: ScheduleSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for year + section uniqueness
TimetableSchema.index({ year: 1, section: 1 }, { unique: true });

// Update the updatedAt field before saving
TimetableSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Timetable", TimetableSchema);