// src/components/classsection/Classrooms.js
import React, { useState } from "react";
import ClassroomOptions from "./ClassroomOptions";
import RoomSearch from "./RoomSearch";
import StaffSearch from "./StaffSearch";
import ProjectorSearch from "./ProjectorSearch";
import LabSearch from "./LabSearch";
import "./Classrooms.css";

const Classrooms = () => {
  const [view, setView] = useState("options");

  if (view === "options") {
    return <ClassroomOptions setView={setView} />;
  }
  if (view === "room") {
    return <RoomSearch goBack={() => setView("options")} />;
  }
  if (view === "staff") {
    return <StaffSearch goBack={() => setView("options")} />;
  }
  if (view === "projector") {
    return <ProjectorSearch goBack={() => setView("options")} />;
  }
  if (view === "lab") {
    return <LabSearch goBack={() => setView("options")} />;
  }

  return <div>Not implemented</div>;
};

export default Classrooms;
