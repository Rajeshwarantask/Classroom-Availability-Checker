// src/timetableUtils.js
import axios from "axios";

// Generate payload
export function createUpdatePayload({ day, period, subject, faculty, room }) {
  if (!subject || !faculty || !room) return null;
  return {
    day,
    period,
    subject,
    faculty,
    room,
    occupied: true
  };
}


// Send update request to backend
export async function sendPeriodUpdate({ year, section, payload }) {
  try {
    const res = await axios.put("/api/timetable/update", {
      year,
      section,
      ...payload
    });
    return res.data;
  } catch (err) {
    console.error("Failed to update period:", err.response?.data || err.message);
    throw err;
  }
}
