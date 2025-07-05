// src/components/ProjectorSearch.js
import React, { useState } from "react";
import axios from "axios";
import "./ProjectorSearch.css";

const ProjectorSearch = ({ goBack }) => {
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState(1);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // Function to handle projector search
  const handleSearch = async () => {
    setError("");
    setResults(null);

    try {
      const response = await axios.get("/api/projector", {
        params: { day, period },
      });

      if (response.data && response.data.rooms) {
        console.log("🛠 Updating Frontend State with:", response.data);
        setResults({ ...response.data }); // Force state update
      } else {
        setError("No data found for the given inputs.");
      }
    } catch (error) {
      console.error("Error fetching projector data:", error);
      setError(error.response?.data?.error || "Failed to fetch data. Try again later.");
    }
  };

  // Function to reset inputs
  const handleReset = () => {
    setDay("Monday");
    setPeriod(1);
    setResults(null);
    setError("");
  };
  
  const getPeriodSuffix = (period) => {
    if (period === 1) return "st";
    if (period === 2) return "nd";
    if (period === 3) return "rd";
    return "th";
  };

  return (
    <div className="projector-search">
      <h2>Projector Availability Checker</h2>

      {/* Input Fields */}
      <div className="filters">
        <label>Day:</label>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label>Period (1-8):</label>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Buttons */}
      <div className="button-group">
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={goBack}>Back</button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="results">
          <h3>Results:</h3>
          {results.rooms && results.rooms.length > 0 ? (
            <p>
              <strong>Rooms:</strong> {results.rooms.join(", ")} <br />
              <strong>Day:</strong> {results.day} <br />
              <strong>Period:</strong> {period} {getPeriodSuffix(parseInt(period))} Hour<br />
              <strong>Projector Available:</strong> {results.rooms.length > 0 ? "Yes" : "No"}
            </p>
          ) : (
            <p>No available room with a projector for the selected period.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectorSearch;
