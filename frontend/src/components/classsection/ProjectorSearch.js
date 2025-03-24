// src/components/ProjectorSearch.js
import React, { useState } from "react";
import axios from "axios";
import "./ProjectorSearch.css";

const ProjectorSearch = ({ goBack }) => {
  const [hasProjector] = useState(true); // Default: search for rooms with projector
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    try {
      // For example, the API might accept a parameter like projector=true
      const response = await axios.get("/api/classrooms", {
        params: { projector: hasProjector },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching projector data:", error);
    }
  };

  return (
    <div className="projector-search">
      <h2>Check for Projector</h2>
      <p>Searching for rooms with a projector.</p>
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

export default ProjectorSearch;
