// src/components/Sidebar.js
import React from "react";
import "./Sidebar.css";

const Sidebar = ({ onSelectPage }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar__title">Classroom Checker</h2>
      <ul className="sidebar__nav">
        <li onClick={() => onSelectPage("dashboard")} className="sidebar__nav-item">
          <span className="material-icons">dashboard</span> Dashboard
        </li>
        <li onClick={() => onSelectPage("classrooms")} className="sidebar__nav-item">
          <span className="material-icons">school</span> Classrooms
        </li>
        <li onClick={() => onSelectPage("events")} className="sidebar__nav-item">
          <span className="material-icons">event</span> Events
        </li>
        <li onClick={() => onSelectPage("details")} className="sidebar__nav-item">
          <span className="material-icons">info</span> Details
        </li>
        <li onClick={() => onSelectPage("settings")} className="sidebar__nav-item">
          <span className="material-icons">settings</span> settings
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
