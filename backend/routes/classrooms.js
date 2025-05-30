const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");
const Projector = require("../models/Projector"); // Adjust the path if needed


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
    console.log(`🔍 Checking classroom availability: ${room} on ${day}, Period: ${periodNum}`);

    // ✅ Fetch allocated rooms
    const allocatedRoomsData = await ClassroomList.findOne().lean();
    if (!allocatedRoomsData || !allocatedRoomsData.classrooms) {
      return res.status(500).json({ error: "Allocated rooms data not found" });
    }

    const allocatedRooms = allocatedRoomsData.classrooms;
    console.log("✅ Allocated Rooms:", allocatedRooms);

    // ✅ Validate the entered room number
    if (!allocatedRooms.includes(room)) {
      console.log(`❌ Invalid room: ${room}`);
      return res.status(404).json({
        status: "invalid",
        message: `You entered a wrong room number. "${room}" is not found in the allocated rooms.`,
      });
    }

    // ✅ Fetch classroom schedules
    const classrooms = await Classroom.find({});
    let occupiedRooms = new Set();

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodEntry = sectionSchedule.find(entry => entry.period === periodNum);
      if (periodEntry && periodEntry.occupied) {
        occupiedRooms.add(periodEntry.room);
      }
    }

    const occupiedArray = Array.from(occupiedRooms);
    console.log("🚫 Occupied Rooms:", occupiedArray);

    // ✅ Check if the requested room is occupied
    const isOccupied = occupiedRooms.has(room);

    // ✅ Find free rooms
    const freeRooms = allocatedRooms.filter(rm => !occupiedRooms.has(rm));
    console.log("✅ Free Rooms:", freeRooms);

    // ✅ Suggest random alternative room if the original is occupied
    let alternativeRoom = null;
    if (isOccupied && freeRooms.length > 0) {
      const randomIndex = Math.floor(Math.random() * freeRooms.length);
      alternativeRoom = freeRooms[randomIndex];
      console.log(`🔄 Suggested Alternative Room: ${alternativeRoom}`);
    } else if (!isOccupied) {
      console.log(`✅ Room ${room} is FREE for Period ${periodNum} on ${day}.`);
    }

    if (!isOccupied) {
      return res.json({
        status: "free",
        message: "The classroom is free during the selected period.",
      });
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

    console.log(`❌ Room ${room} is OCCUPIED by ${facultyName} for ${subject}, Section ${section}, Year ${year}.`);

    const getPeriodSuffix = (period) => {
      if (period === 1) return "1st";
      if (period === 2) return "2nd";
      if (period === 3) return "3rd";
      return `${period}th`;
    };

    return res.json({
      status: "occupied",
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
    console.error("❌ Error checking availability:", error);
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



/////////////projector //////////////////



router.get("/projector", async (req, res) => {
  try {
    const { day, period } = req.query;

    if (!day || !period) {
      return res.status(400).json({ error: "Day and period are required" });
    }

    const periodNum = parseInt(period, 10);

    console.log(`🔍 Searching for projector rooms on ${day}, Period: ${periodNum}`);

    // ✅ Fetch all allocated rooms
    const allocatedRoomsData = await ClassroomList.findOne().lean();
    if (!allocatedRoomsData || !allocatedRoomsData.classrooms) {
      return res.status(500).json({ error: "Allocated rooms data not found" });
    }
    const allocatedRooms = allocatedRoomsData.classrooms;
    console.log("✅ Allocated Rooms:", allocatedRooms);

    // ✅ Fetch classroom schedules
    const classrooms = await Classroom.find({});
    let occupiedRooms = new Set();

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodEntry = sectionSchedule.find(entry => entry.period === periodNum);
      if (periodEntry && periodEntry.occupied) {
        occupiedRooms.add(periodEntry.room);
      }
    }
    console.log("🚫 Occupied Rooms:", Array.from(occupiedRooms));

    // ✅ Find free rooms (allocated rooms that are NOT occupied)
    const freeRooms = allocatedRooms.filter(rm => !occupiedRooms.has(rm));
    console.log("✅ Free Rooms:", freeRooms);

    // ✅ Fetch projector room data from the Projector collection
    const projectorRoomsData = await Projector.find({});
    const projectorRooms = new Set(projectorRoomsData.map(entry => entry.room));
    console.log("🎥 Projector Rooms:", Array.from(projectorRooms));


    // ✅ Find all free rooms that have projectors
    const availableProjectorRooms = freeRooms.filter(rm => projectorRooms.has(rm));

    if (availableProjectorRooms.length === 0) {
      console.log("❌ No available room with a projector for the selected period.");
      return res.json({ message: "No available room with a projector for the selected period.", rooms: [] });
    }

    console.log(`✅ Found Projector Rooms: ${availableProjectorRooms}`);
    return res.json({
      message: `Rooms ${availableProjectorRooms.join(", ")} are available with a projector for Period ${period} on ${day}.`,
      rooms: availableProjectorRooms, // Return all available projector rooms
      day,
      period,
      projector: true
    });


  } catch (error) {
    console.error("❌ Error fetching projector data:", error);
    return res.status(500).json({ error: "Server error" });
  }
});




///// lab list/// 
// //****8 */ Returns a list of distinct faculty members (id and name)
//  across all classrooms.************//

router.get("/lab-list", async (req, res) => {
  try {
    const classrooms = await Classroom.aggregate([
      {
        $project: {
          allRooms: {
            $concatArrays: [
              "$schedule.Monday",
              "$schedule.Tuesday",
              "$schedule.Wednesday",
              "$schedule.Thursday",
              "$schedule.Friday"
            ]
          }
        }
      },
      { $unwind: "$allRooms" },
      {
        $match: {
          "allRooms.room": { $regex: "lab", $options: "i" } // ✅ Matches 'lab' in room name
        }
      },
      {
        $group: {
          _id: "$allRooms.room"
        }
      },
      {
        $project: {
          _id: 0,
          room: "$_id"
        }
      }
    ]);

    res.json(classrooms);
  } catch (error) {
    console.error("Error fetching lab list:", error);
    res.status(500).json({ error: "Server error" });
  }
});



////***************lab **********************///
//* GET /api/check-lab-availability?room_number=lab&day=Monday&period=1
//* Checks if a specific lab is free or occupied during a given day and period.
//*/

router.get("/check-lab-availability", async (req, res) => {
  try {
    const { room, day, period } = req.query;

    if (!room || !day || !period) {
      return res.status(400).json({ error: "Room, day, and period are required" });
    }

    const periodNum = parseInt(period, 10);
    console.log(`🔍 Checking lab availability: ${room} on ${day}, Period: ${periodNum}`);

    // ✅ Fetch all allocated rooms
    const allocatedRoomsData = await ClassroomList.findOne().lean();
    if (!allocatedRoomsData || !allocatedRoomsData.classrooms) {
      return res.status(500).json({ error: "Allocated rooms data not found" });
    }
    const allocatedRooms = allocatedRoomsData.classrooms;
    console.log("✅ Allocated Rooms:", allocatedRooms);

    // ✅ Fetch classroom schedules
    const classrooms = await Classroom.find({});
    let occupiedRooms = new Set();

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodEntry = sectionSchedule.find(entry => entry.period === periodNum);
      if (periodEntry && periodEntry.occupied) {
        occupiedRooms.add(periodEntry.room);
      }
    }
    console.log("🚫 Occupied Labs:", Array.from(occupiedRooms));

    // ✅ Find free rooms (allocated rooms that are NOT occupied)
    const freeRooms = allocatedRooms.filter(rm => !occupiedRooms.has(rm));
    console.log("✅ Free Rooms:", freeRooms);

    // ✅ Find all LABS (rooms with letters)
    const labPattern = /[a-zA-Z]/;
    const availableLabs = freeRooms.filter(rm => labPattern.test(rm));
    console.log("🔍 Available Labs:", availableLabs);

    // ✅ Choose an alternative lab (if available)
    let alternativeLab = availableLabs.length > 0 ? availableLabs[0] : "No alternative available";
    console.log(`🔄 Suggested Alternative Lab: ${alternativeLab}`);

    // ✅ Check if the requested lab is occupied
    const isOccupied = occupiedRooms.has(room);

    if (!isOccupied) {
      console.log(`✅ Lab ${room} is FREE for Period ${periodNum} on ${day}.`);
      return res.json({ 
        status: "free",
        message: "The lab is free during the selected period." 
      });
    }

    // ✅ Find faculty and subject details
    let facultyName = "N/A", subject = "N/A", section = "N/A", year = "N/A";

    for (const cls of classrooms) {
      const sectionSchedule = cls.schedule[day] || [];
      const periodObj = sectionSchedule.find(entry => entry.period === periodNum && entry.room === room);

      if (periodObj) {
        facultyName = cls.faculty.find(f => f.id === periodObj.facultyId)?.name || "N/A";
        subject = periodObj.subject || "N/A";
        section = cls.section || "N/A";
        year = cls.year || "N/A";
        break;
      }
    }

    console.log(`❌ Lab ${room} is OCCUPIED by ${facultyName} for ${subject}, Section ${section}, Year ${year}.`);

    return res.json({
      status: "occupied",
      message: "The lab is occupied.",
      roomDetails: {
        room,
        faculty: facultyName,
        subject,
        section,
        year,
        period: periodNum
      },
      alternativeLab: alternativeLab  // ✅ Add alternative lab to response
    });

  } catch (error) {
    console.error("❌ Error checking lab availability:", error);
    return res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;