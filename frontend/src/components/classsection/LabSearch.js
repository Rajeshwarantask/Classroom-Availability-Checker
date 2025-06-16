// src/components/LabSearch.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LabSearch.css";

const LabSearch = ({ goBack }) => {
  const [selectedLab, setSelectedLab] = useState(""); // Selected lab room
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState("1");
  const [labList, setLabList] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Fetch available labs from backend
  useEffect(() => {
    axios
      .get("/api/lab-list")
      .then((res) => {
        setLabList(res.data);
        if (res.data.length > 0) {
          setSelectedLab(res.data[0].room);
        }
      })
      .catch((err) => console.error("Error fetching lab list:", err));
  }, []);

  // Search lab availability
  const handleCheckLab = async () => {
    setResult(null);
    setError("");

    if (!selectedLab || !day || !period) {
      setError("Please select a Lab, Day, and Period.");
      return;
    }

    try {
      console.log(`🔍 Checking lab availability for Room: ${selectedLab}, Day: ${day}, Period: ${period}`);
//new api 
      const response = await axios.get("/check-lab-availability", {
        params: { room: selectedLab, day, period },
      });      

      console.log("✅ Lab Search Response:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("❌ Error checking lab availability:", err);
      setError("Lab not found or server error.");
    }
  };

  // Update selected lab
  const handleSelectLab = (lab) => {
    setSelectedLab(lab.room);
  };

  const getPeriodSuffix = (period) => {
    if (period === 1) return "st";
    if (period === 2) return "nd";
    if (period === 3) return "rd";
    return "th";
  };

  return (
    <div className="lab-search-layout">
      {/* Left: Search form */}
      <div className="lab-search-container">
        <h2>Check Lab Availability</h2>
        <div className="search-filters">
          <div className="search-row">
            <label>Selected Lab:</label>
            <input type="text" value={selectedLab} readOnly />
          </div>
          <div className="search-row">
            <label>Day:</label>
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
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
            <button onClick={handleCheckLab}>Search</button>
            <button onClick={goBack}>Back</button>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="result">
            <h3>Lab Availability</h3>
            {result.status === "occupied" && result.roomDetails ? (
              <>
                <p><strong>Status:</strong> Lab Occupied</p>
                <p><strong>Room No:</strong> {result.roomDetails.room}</p>
                <p><strong>Faculty:</strong> {result.roomDetails.faculty}</p>
                <p><strong>Subject:</strong> {result.roomDetails.subject}</p>
                <p><strong>Section:</strong> {result.roomDetails.section}</p>
                <p><strong>Year:</strong> {result.roomDetails.year}</p>
                <p><strong>Period:</strong> {period}{getPeriodSuffix(parseInt(period))} Hour</p>

                {/* ✅ Show Alternative Lab */}
                <p><strong>Alternative Lab:</strong> {result.alternativeLab !== "No alternative available" ? result.alternativeLab : "No available labs"}</p>
              </>
            ) : result.status === "free" ? (
              <p><strong>Status:</strong> Lab is Free</p>
            ) : (
              <p>No data available.</p>
            )}
          </div>
        )}

      </div>

      {/* Right: Lab List */}
      <div className="lab-list-container">
        <h3>Available Labs</h3>
        <ul className="lab-list">
          {labList.map((lab) => (
            <li key={lab.room} className="lab-item">
              <span>{lab.room}</span>
              <button className="plus-button" onClick={() => handleSelectLab(lab)}>+</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LabSearch;
