import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Classrooms from "./components/classsection/Classrooms"; // updated path
import Events from "./components/Events";
import Detail from "./components/Details"; // Import the Events component
import Settings from "./components/Settings"; // Add this line to import Settings
import "./App.css";

function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true); // for desktop
  const [sidebarMobile, setSidebarMobile] = useState(false); // for mobile

  return (
    <div className="app-container">
      <Sidebar
        onSelectPage={setSelectedPage}
        open={sidebarOpen}
        mobileOpen={sidebarMobile}
        setOpen={setSidebarOpen}
        setMobileOpen={setSidebarMobile}
        // ...other props
        className={sidebarMobile ? "sidebar sidebar-active" : "sidebar"}
      />
      <div className={`main-content${sidebarMobile ? " content-shift" : ""}`}>
        <header className="header">
          <div className="header__left">
            
            <h2>Welcome, Rajeshwaran</h2>
          </div>
          <div className="header__right">
            <span className="material-icons header__icon">notifications</span>
            <span className="material-icons header__icon">account_circle</span>
          </div>
        </header>
        <div className="content">
          {selectedPage === "dashboard" && <Dashboard />}
          {selectedPage === "classrooms" && <Classrooms />}
          {selectedPage === "events" && <Events />} 
          {selectedPage === "details" && <Detail />}
          {selectedPage === "settings" && <Settings />} 
          {/* Add Events Section */}
        </div>
      </div>
    </div>
  );
}

export default App;
