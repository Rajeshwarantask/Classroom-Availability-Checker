// src/components/classsection/ClassroomOptions.js
import React from "react";
import "./ClassroomOptions.css";

const ClassroomOptions = ({ setView }) => {
  return (
    <div className="classroom-options">
      <h1>Classroom Section</h1>
      <div className="options-buttons">
        <button onClick={() => setView("room")}>Check for Room</button>
        <button onClick={() => setView("staff")}>Check for Staff</button>
        <button onClick={() => setView("projector")}>Check for Projector</button>
        <button onClick={() => setView("lab")}>Check for Lab</button>
      </div>
    </div>
  );
};

export default ClassroomOptions;
