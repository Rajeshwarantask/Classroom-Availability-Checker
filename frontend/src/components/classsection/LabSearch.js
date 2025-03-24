// src/components/LabSearch.js
import React, { useState } from "react";
import axios from "axios";
import "./LabSearch.css";

const LabSearch = ({ goBack }) => {
  const [isLab] = useState(true);// Default: search for lab rooms
  const [results, setResults] = useState(null);
  const handleSearch = async () => {
    try {
      // For example, the API might accept a parameter like lab=true
      const response = await axios.get("/api/classrooms", {
        params: { lab: isLab },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching lab data:", error);
    }
  };

  return (
    <div className="lab-search">
      <h2>Check for Lab</h2>
      <p>Searching for lab rooms.</p>
      <div className="button-group">
        <button onClick={handleSearch}>Search</button>
        <button onClick={goBack}>Back</button>
      </div>
      
      {results && (
        <div className="results">
          <h3>Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LabSearch;
