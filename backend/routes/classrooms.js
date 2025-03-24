const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");


/**
 * GET /api/check-availability?room_number=701&day=Monday&period=1
 * Checks if a specific room is free or occupied during a given day and period.
 */
const ClassroomList = require("../models/ClassroomList"); // Import ClassroomList

router.get("/check-availability", async (req, res) => {
  try {
    const { room, day, period } = req.query;
    if (!room || !day || !period) {
      return res.status(400).json({ error: "Room, day, and period are required" });
    }

    const periodNum = parseInt(period, 10);

    // ✅ Fetch classroom schedules and allocated rooms
    const classrooms = await Classroom.find({});
    const allocatedRoomsData = await ClassroomList.findOne().lean();

    if (!allocatedRoomsData || !allocatedRoomsData.classrooms) {
      return res.status(500).json({ error: "Allocated rooms data not found" });
    }

    const allocatedRooms = allocatedRoomsData.classrooms; // ✅ ["701", "702", "703", ...]
    
    // ✅ Find all rooms in use for that period across sections
    let occupiedRooms = new Set();

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodEntry = sectionSchedule.find(entry => entry.period === periodNum);

      if (periodEntry && periodEntry.occupied) {
        occupiedRooms.add(periodEntry.room); // ✅ Store occupied room
      }
    }

    // ✅ Check if the requested room is occupied
    const isOccupied = occupiedRooms.has(room);

    if (!isOccupied) {
      return res.json({ message: "The classroom is free during the selected period." });
    }

    // ✅ Find faculty and subject details
    let facultyName = "N/A", subject = "N/A", year = "N/A", section = "N/A";

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodObj = sectionSchedule.find(entry => entry.period === periodNum && entry.room === room);

      if (periodObj) {
        facultyName = cls.faculty.find(f => f.id === periodObj.facultyId)?.name || "N/A";
        subject = periodObj.subject || "N/A";
        year = cls.year || "N/A";
        section = cls.section || "N/A";
        break;
      }
    }

    // ✅ Find an alternative room
    let alternativeRoom = allocatedRooms.find(rm => !occupiedRooms.has(rm));

    const getPeriodSuffix = (period) => {
      if (period === 1) return "1st";
      if (period === 2) return "2nd";
      if (period === 3) return "3rd";
      return `${period}th`;
    };
    
    console.log("Occupied Rooms:", Array.from(occupiedRooms));
    console.log("Alternative Room:", alternativeRoom || "No alternative room found.");

    return res.json({
      message: "The classroom is occupied.",
      roomDetails: {
        room,
        faculty: facultyName,
        subject,
        year,
        section,
        period: getPeriodSuffix(periodNum),
      },
      alternativeRoom: alternativeRoom
        ? `Room ${alternativeRoom} is available for Period ${period} on ${day}.`
        : "No alternative classroom found.",
    });

  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({ error: "Server error" });
  }
});






/**
 * GET /api/check-staff?faculty=F002&day=Monday&period=4
 * Checks whether a specific faculty (identified by ID) is teaching during a given day and period.
 * If teaching, returns room details (with schedule) and computes the next free hour.
 * If free, returns a free message.
 */
router.get("/check-staff", async (req, res) => { 
  try {
    const { faculty, day, period } = req.query;
    if (!faculty || !day || !period) {
      return res.status(400).json({ error: "faculty, day, and period are required" });
    }
    const periodNum = parseInt(period, 10);

    // Fetch all classrooms for all sections
    const classrooms = await Classroom.find({});
    if (!classrooms.length) {
      return res.status(404).json({ error: "No data available for classrooms" });
    }

    let occupiedPeriods = new Set();
    let facultyFound = false;
    let roomDetails = null;

    for (const classroom of classrooms) {
      const daySchedule = classroom.schedule[day] || [];

      // Collect all periods where the faculty is teaching across sections
      daySchedule.forEach(pObj => {
        if (pObj.facultyId === faculty && pObj.occupied) {
          occupiedPeriods.add(pObj.period);
          facultyFound = true;
        }
      });

      // If faculty is teaching the current period, save room details
      if (!roomDetails) {
        const periodObj = daySchedule.find(pObj => pObj.period === periodNum && pObj.facultyId === faculty && pObj.occupied);
        if (periodObj) {
          roomDetails = {
            room_number: periodObj.room,
            faculty: classroom.faculty.find(f => f.id === faculty)?.name || "N/A",
            subject: periodObj.subject || "N/A",
            year: classroom.year,
            section: classroom.section,
            day,
            period: periodNum
          };
        }
      }
    }

    if (!facultyFound) {
      return res.json({
        status: "free",
        message: `Faculty ${faculty} is free all day!`,
        nextFreeHour: "Available all periods"
      });
    }

    // Find the first next free period
    let nextFree = null;
    for (let p = periodNum + 1; p <= 8; p++) {
      if (!occupiedPeriods.has(p)) {
        nextFree = p;
        break;
      }
    }

    const nextFreeFormatted = nextFree
      ? `${nextFree}${nextFree === 1 ? "st" : nextFree === 2 ? "nd" : nextFree === 3 ? "rd" : "th"} Period`
      : "No next free hour";

    console.log("Occupied Periods:", Array.from(occupiedPeriods));
    console.log("Next Free Hour:", nextFreeFormatted);

    return res.json({
      status: roomDetails ? "occupied" : "free",
      message: roomDetails ? `Faculty ${roomDetails.faculty} is teaching during Period ${periodNum}.` : `Faculty ${faculty} is free now!`,
      roomDetails: roomDetails ? { ...roomDetails, nextFreeHour: nextFreeFormatted } : { nextFreeHour: nextFreeFormatted }
    });
    
  } catch (error) {
    console.error("Error checking staff availability:", error);
    return res.status(500).json({ error: "Server error" });
  }
});





/**
 * GET /api/faculty-list
 * Returns a list of distinct faculty members (id and name) across all classrooms.
 */
router.get("/faculty-list", async (req, res) => {
  try {
    const facultyList = await Classroom.aggregate([
      { $unwind: "$faculty" },
      { $group: { _id: "$faculty.id", name: { $first: "$faculty.name" } } },
      { $project: { _id: 0, id: "$_id", name: 1 } }
    ]);
    res.json(facultyList);
  } catch (error) {
    console.error("Error fetching faculty list:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;