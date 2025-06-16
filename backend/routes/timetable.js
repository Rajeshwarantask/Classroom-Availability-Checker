const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");

// 🔍 View full timetable
router.get("/", async (req, res) => {
  const { year, section } = req.query;
  try {
    const classroom = await Classroom.findOne({ year, section });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });
    res.json(classroom.schedule);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ Update a specific period
router.put("/update", async (req, res) => {
  const { year, section, day, period, updates } = req.body;
  try {
    const classroom = await Classroom.findOne({ year, section });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const schedule = classroom.schedule[day];
    const periodIndex = schedule.findIndex(p => p.period === period);
    if (periodIndex === -1) return res.status(404).json({ error: "Period not found" });

    Object.assign(schedule[periodIndex], updates);
    classroom.markModified("schedule");
    await classroom.save();
    res.json({ message: "Period updated successfully", updatedPeriod: schedule[periodIndex] });
  } catch (error) {
    console.error("Error updating period:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ❌ Delete a period (reset to default/free)
router.delete("/delete", async (req, res) => {
  const { year, section, day, period } = req.body;
  try {
    const classroom = await Classroom.findOne({ year, section });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const schedule = classroom.schedule[day];
    const periodIndex = schedule.findIndex(p => p.period === period);
    if (periodIndex === -1) return res.status(404).json({ error: "Period not found" });

    schedule[periodIndex] = {
      period,
      facultyId: null,
      occupied: false,
      room: null,
      subject: null,
      projector: false,
    };

    classroom.markModified("schedule");
    await classroom.save();
    res.json({ message: "Period cleared successfully" });
  } catch (error) {
    console.error("Error deleting period:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ➕ Add a new period (if not exists)
router.post("/add", async (req, res) => {
  const { year, section, day, period, newEntry } = req.body;
  try {
    const classroom = await Classroom.findOne({ year, section });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    const schedule = classroom.schedule[day];
    const exists = schedule.some(p => p.period === period);
    if (exists) return res.status(400).json({ error: "Period already exists. Use update instead." });

    schedule.push({ period, ...newEntry });
    classroom.markModified("schedule");
    await classroom.save();
    res.json({ message: "Period added successfully", addedPeriod: { period, ...newEntry } });
  } catch (error) {
    console.error("Error adding period:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
