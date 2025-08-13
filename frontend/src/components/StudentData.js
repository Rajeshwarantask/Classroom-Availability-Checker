import React from "react";
import "./StudentData.css";

const StudentData = ({ setView }) => {
  return (
    <div className="student-Data-container">
      <h1>Student Data</h1>
      <div className="options-buttons">
        <button onClick={() => setView("addStudent")}>Add Timetable</button>
        <button onClick={() => setView("studentChangeOptions")}>Modify Timetable</button>
        <button onClick={() => setView("viewTimetable")}>View Timetable</button>
      </div>
    </div>
  );
};

export default StudentData;
