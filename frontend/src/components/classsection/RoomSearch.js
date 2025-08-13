import React, { useState } from "react";
import axios from "axios";
import "./RoomSearch.css";

const RoomSearch = ({ goBack }) => {
  const [room, setRoom] = useState("");
  const [day, setDay] = useState("Monday");
  const [period, setPeriod] = useState("1");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = async () => {
    setResult(null);
    setError("");
    setLoading(true);

    if (!room.trim() || !day || !period) {
      setError("Please enter Room, Day, and Period.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/check-availability", {
        params: { room: room.toUpperCase(), day, period },
      });

      setResult(response.data);

      // Handle invalid room explicitly
      if (response.data.status === "invalid") {
        setError(response.data.message);
        setResult(null);
      }

    } catch (err) {
      console.error("Error checking availability:", err);
      setError(err.response?.data?.error || "Room not found or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-search-container">
      <h2>Check Availability</h2>
      <div className="search-filters">
        <div className="search-row">
          <label>Classroom (Room):</label>
          <input
            type="text"
            placeholder="Enter Room"
            value={room}
            onChange={(e) => setRoom(e.target.value.toUpperCase())}
          />
        </div>
        <div className="search-row">
          <label>Day:</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
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
          <button onClick={handleCheckAvailability} disabled={loading}>
            {loading ? "Checking..." : "Search"}
          </button>
          <button onClick={() => {
            setRoom("");
            setResult(null);
            setError("");
          }}>Reset</button>
          <button onClick={goBack}>Back</button>
        </div>
      </div>

      {loading && <p className="loading">Checking availability...</p>}
      {error && <p className="error">{error}</p>}

      {result && result.message && result.status === "free" && (
        <div className="result">
          <p className="info">{result.message}</p>
        </div>
      )}

      {result && result.message && result.status === "occupied" && result.roomDetails && (
        <div className="result">
          <p className="info">{result.message}</p>
          <h3>Room Details</h3>
          <p><strong>Room Number:</strong> {result.roomDetails.room}</p>
          <p><strong>Period:</strong> {result.roomDetails.period} Hour</p>
          <p><strong>Faculty:</strong> {result.roomDetails.faculty}</p>
          <p><strong>Year:</strong> {result.roomDetails.year}</p>
          <p><strong>Section:</strong> {result.roomDetails.section}</p>
          <p><strong>Subject:</strong> {result.roomDetails.subject}</p>
          <p><strong>Occupied:</strong> Yes</p>
          {result.alternativeRoom && <p className="info">{result.alternativeRoom}</p>}
        </div>
      )}
    </div>
  );
};

export default RoomSearch;
