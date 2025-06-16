import React, { useState, useEffect } from "react";
import { createUpdatePayload } from "./timetableUtils";

const TimetableEditor = ({ year, section, mode, commitMsg }) => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/timetable/${year}/${section}`)
      .then(res => {
        if (!res.ok) throw new Error("Timetable not found");
        return res.json();
      })
      .then(data => {
        setTimetable(data.schedule || {});
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load timetable.");
        setLoading(false);
        console.error(err);
      });
  }, [year, section]);

  const handleChange = (day, period, field, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map(p =>
        p.period === period ? { ...p, [field]: value, occupied: true } : p
      )
    }));
  };

  const handleSave = () => {
    const updates = [];
    for (const day in timetable) {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach(slot => {
          if (slot.occupied) {
            const payload = createUpdatePayload({ day, ...slot });
            if (payload) updates.push(payload);
          }
        });
      }
    }

    fetch("/api/update-timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, section, updates, commitMsg })
    })
      .then(res => res.json())
      .then(data => alert("Timetable updated successfully!"))
      .catch(err => {
        console.error(err);
        alert("Failed to update timetable.");
      });
  };

  if (loading) return <div>Loading timetable...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h3>
        {mode === "view"
          ? "View"
          : mode === "update"
          ? "Update"
          : "Delete"}{" "}
        Timetable ({year} - {section})
      </h3>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Day</th>
            <th>Period</th>
            <th>Subject</th>
            <th>Faculty</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(timetable).map(([day, periods]) =>
            Array.isArray(periods) ? (
              periods.map((slot, idx) => (
                <tr key={day + idx}>
                  <td>{day}</td>
                  <td>{slot.period}</td>
                  <td>
                    {mode === "view" ? (
                      slot.subject
                    ) : (
                      <input
                        value={slot.subject}
                        onChange={e =>
                          handleChange(day, slot.period, "subject", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>
                    {mode === "view" ? (
                      slot.faculty
                    ) : (
                      <input
                        value={slot.faculty}
                        onChange={e =>
                          handleChange(day, slot.period, "faculty", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td>
                    {mode === "view" ? (
                      slot.room
                    ) : (
                      <input
                        value={slot.room}
                        onChange={e =>
                          handleChange(day, slot.period, "room", e.target.value)
                        }
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr key={day}>
                <td>{day}</td>
                <td colSpan="4" style={{ color: "gray" }}>
                  No valid periods data
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {mode === "update" && (
        <button onClick={handleSave} style={{ marginTop: "1rem" }}>
          Save Changes
        </button>
      )}
    </div>
  );
};

export default TimetableEditor;
