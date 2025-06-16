import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StaffSearch.css";

const StaffSearch = ({ goBack }) => {
  const [faculty, setFaculty] = useState(""); // Faculty id
  const [facultyName, setFacultyName] = useState(""); // For display purposes
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState("1");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    // Fetch the faculty list from backend    
    axios.get("/api/faculty-list")
      .then((res) => {
        setFacultyList(res.data);
        if (res.data.length > 0) {
          setFaculty(res.data[0].id);
          setFacultyName(res.data[0].name);
        }
      })
      .catch((err) => console.error("Error fetching faculty list:", err));
  }, []);

  const handleCheckStaff = async () => {
    setResult(null);
    setError("");

    if (!faculty || !day || !period) {
      setError("Please select Faculty, Day, and Period.");
      return;
    }

    try {
      const response = await axios.get("/api/check-staff", {
        params: { faculty, day, period },
      });
      console.log("Check Staff Response:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("Error checking staff availability:", err);
      setError("Staff not found or server error.");
    }
  };

  const handleSelectFaculty = (fac) => {
    setFaculty(fac.id);
    setFacultyName(fac.name);
  };

  // Compute Next Free Hour only if schedule data is available in result.roomDetails.
  const getPeriodSuffix = (period) => {
    if (period === 1) return "st";
    if (period === 2) return "nd";
    if (period === 3) return "rd";
    return "th";
  };
  return (
    <div className="staff-search-layout">
      {/* Left side: search form */}
      <div className="staff-search-container">
        <h2>Check Staff Availability</h2>
        <div className="search-filters">
          <div className="search-row">
            <label>Faculty:</label>
            <input
              type="text"
              placeholder="Select from list or type here"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
            />
          </div>
          <div className="search-row">
            <label>Day:</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>
          <div className="search-row">
            <label>Period (1-8):</label>
            <input
              type="number"
              min="1"
              max="8"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button onClick={handleCheckStaff}>Search</button>
            <button onClick={goBack}>Back</button>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="result">
            <h3>Staff Availability</h3>
            {result.status === "occupied" && result.roomDetails ? (
              <>
                <p><strong>Status:</strong> Class Going</p>
                <p><strong>Room No:</strong> {result.roomDetails.room_number}</p>
                <p><strong>Faculty:</strong> {result.roomDetails.faculty}</p>
                <p><strong>Year:</strong> {result.roomDetails.year}</p>
                <p><strong>Subject:</strong> {result.roomDetails.subject}</p>
                <p><strong>Day:</strong> {day}</p>
                <p><strong>Period:</strong> {period}{getPeriodSuffix(parseInt(period))} Hour</p>
                <p><strong>Next Free Hour:</strong> {result.roomDetails.nextFreeHour || "No schedule data"}</p>
              </>
            ) : result.status === "free" ? (
              <>
                <p><strong>Status:</strong> Free</p>
                <p>Faculty : {result.roomDetails.faculty} free now!</p>
              </>
            ) : (
              <p>No data available.</p>
            )}
          </div>
        )}
      </div>

      {/* Right side: faculty list */}
      <div className="faculty-list-container">
        <h3>Faculty List</h3>
        <ul className="faculty-list">
          {facultyList.map((fac) => (
            <li key={fac.id || fac.name} className="faculty-item">
              <span>{fac.name}</span>
              <button className="plus-button" onClick={() => handleSelectFaculty(fac)}>
                +
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaffSearch;


