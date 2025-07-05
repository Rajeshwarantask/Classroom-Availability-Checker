const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");
const ClassroomList = require("../models/ClassroomList");
const Projector = require("../models/Projector"); // ✅ Added projector collection

const periods = [
  { start: "08:00", end: "08:50" },
  { start: "08:50", end: "09:40" },
  { start: "09:50", end: "10:40" },
  { start: "10:40", end: "11:30" },
  { start: "12:20", end: "01:10" },
  { start: "01:10", end: "02:00" },
  { start: "02:00", end: "02:50" },
  { start: "02:50", end: "03:40" },
];

function getCurrentPeriodIndex(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const currentMinutes = h * 60 + m;
  for (let i = 0; i < periods.length; i++) {
    const [sh, sm] = periods[i].start.split(":").map(Number);
    const [eh, em] = periods[i].end.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    if (currentMinutes >= startMins && currentMinutes < endMins) {
      return i;
    }
  }
  return -1;
}

router.get("/dashboard-stats", async (req, res) => {
  try {
    const allocatedData = await ClassroomList.findOne().lean();
    const allocatedRooms = allocatedData?.classrooms || [];
    const totalRooms = allocatedRooms.length;

    const projectorData = await Projector.find({});
    const projectorRoomSet = new Set(projectorData.map(p => p.room)); // ✅ Accurate projector room set

    const classrooms = await Classroom.find({});
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Get day from query or default to current day
    const { day, period } = req.query;
    const now = new Date();
    const currentDay = weekdays[now.getDay()]; // Current weekday
    const selectedDay = day || currentDay; // Use provided day or current day
    const timeStr = now.toTimeString().split(" ")[0].slice(0, 5);
    const requestedPeriod = period !== undefined
      ? parseInt(period)
      : getCurrentPeriodIndex(timeStr);

    let occupiedNow = new Set();

    for (const cls of classrooms) {
      const schedule = cls.schedule?.[selectedDay] || [];
      const periodEntry = schedule[requestedPeriod];
      if (periodEntry?.occupied) {
        occupiedNow.add(periodEntry.room);
      }
    }

    const isOccupied = room => occupiedNow.has(room);
    const isLab = room => /lab/i.test(room);
    const isProjector = room => projectorRoomSet.has(room); // ✅ Use projector collection
    const isClassroom = room => !isLab(room) && !isProjector(room);

    const freeRooms = allocatedRooms.filter(r => !isOccupied(r));
    const freeLabs = allocatedRooms.filter(r => isLab(r) && !isOccupied(r));
    const occupiedLabs = allocatedRooms.filter(r => isLab(r) && isOccupied(r));

    const freeProjectorRooms = allocatedRooms.filter(r => isProjector(r) && !isOccupied(r));
    const occupiedProjectorRooms = allocatedRooms.filter(r => isProjector(r) && isOccupied(r));

    const freeClassrooms = allocatedRooms.filter(r => isClassroom(r) && !isOccupied(r));
    const occupiedClassrooms = allocatedRooms.filter(r => isClassroom(r) && isOccupied(r));

    const isManual = period !== undefined;
    const label = requestedPeriod >= 0 && requestedPeriod < periods.length
      ? `Period ${requestedPeriod + 1}`
      : "Outside Class Hours";

    console.log("\n================= 📊 PERIOD STATS LOG =================");
    console.log(`🗓️ Day: ${selectedDay} | ⏰ Time: ${timeStr}`);
    console.log(`🔢 Period: ${label} (${isManual ? "Manual" : "Auto"})`);
    console.log(`🏫 Total Classrooms Allocated (no labs/projectors): ${freeClassrooms.length + occupiedClassrooms.length}`);
    console.log(`✅ Free Classrooms (${freeClassrooms.length}): [${freeClassrooms.join(", ")}]`);
    console.log(`🎥 Free Projector Rooms (${freeProjectorRooms.length}): [${freeProjectorRooms.join(", ")}]`);
    console.log(`🧪 Free Labs (${freeLabs.length}): [${freeLabs.join(", ")}]`);
    console.log("=======================================================\n");

    const occupiedThisWeekMap = {
      Monday: new Set(),
      Tuesday: new Set(),
      Wednesday: new Set(),
      Thursday: new Set(),
      Friday: new Set(),
    };

    for (const cls of classrooms) {
      for (const weekDay of Object.keys(occupiedThisWeekMap)) {
        const schedule = cls.schedule?.[weekDay] || [];
        schedule.forEach(entry => {
          if (entry.occupied) {
            occupiedThisWeekMap[weekDay].add(entry.room);
          }
        });
      }
    }

    const barChart = {};
    const weekdaysToTrack = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    for (const weekDay of weekdaysToTrack) {
      let freeCount = 0;

      for (let periodIndex = 0; periodIndex < periods.length; periodIndex++) {
        const occupiedThisSlot = new Set();

        for (const cls of classrooms) {
          const schedule = cls.schedule?.[weekDay] || [];
          const periodEntry = schedule[periodIndex];
          if (periodEntry?.occupied) {
            occupiedThisSlot.add(periodEntry.room);
          }
        }

        // Count free rooms in this period
        const freeThisPeriod = allocatedRooms.filter(r => !occupiedThisSlot.has(r));
        freeCount += freeThisPeriod.length;
      }

      barChart[weekDay] = freeCount;
    }

    res.json({
      currentPeriod: requestedPeriod,
      periodLabel: label,
      time: now.toLocaleTimeString(),
      pieChart: {
        free: freeRooms.length,
        occupied: totalRooms - freeRooms.length,
      },
      barChart,
      resources: {
        totalRooms,
        labs: freeLabs.length + occupiedLabs.length,
        projectorRooms: freeProjectorRooms.length + occupiedProjectorRooms.length,
        classrooms: freeClassrooms.length + occupiedClassrooms.length,
      },
      freeProjectorRoomNames: freeProjectorRooms, // ✅ Optional: can be shown on frontend
    });

  } catch (err) {
    console.error("❌ Error in /dashboard-stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
