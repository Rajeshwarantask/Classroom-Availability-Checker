import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Classrooms from "./components/classsection/Classrooms";
import Events from "./components/Events";
import Detail from "./components/Details";
import Settings from "./components/Settings";
import "./App.css";


const profileMenu = [
  { caption: "Profile", link: "profile" },
  [
    { caption: "Settings", link: "settings" },
    { caption: "Notifications", link: "notifications" },
    { caption: "Events", link: "Events" },
  ],
  { caption: "Support", link: "support" },
  { caption: "About", link: "Details" },
];

function ProfileDropdown({ userName, onMenuClicked, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="profile-dropdown" ref={ref}>
      <span
        className="material-icons profile-icon"
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 32,
          cursor: "pointer",
          color: "#2c3e50",
          borderRadius: "50%",
          padding: "2px",
        }}
        title="Profile"
      >
        account_circle
      </span>
      {open && (
        <div className="profile-menu">
          <div className="profile-preamble">
            <small>Hi {userName}!</small>
            <br />
            <small>
              <i>Welcome!</i>
            </small>
          </div>
          <ul>
            {profileMenu.map((item, idx) =>
              Array.isArray(item) ? (
                <div key={idx} className="profile-submenu">
                  {item.map((sub, subIdx) => (
                    <li
                      key={subIdx}
                      onClick={() => {
                        setOpen(false);
                        onMenuClicked(sub.link);
                      }}
                    >
                      {sub.caption}
                    </li>
                  ))}
                </div>
              ) : (
                <li
                  key={item.link}
                  onClick={() => {
                    setOpen(false);
                    onMenuClicked(item.link);
                  }}
                >
                  {item.caption}
                </li>
              )
            )}
          </ul>
          <div className="profile-signout" onClick={onSignOut}>
            <small>Sign Out</small>
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="custom-toast">
      {message}
    </div>
  );
}

function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState("");

  const userName = "Rajeshwaran";

  const handleProfileMenu = (link) => {
    if (link === "settings") setSelectedPage("settings");
    else if (link === "profile") showToast("Profile clicked!");
    else if (link === "notifications") showToast("Notifications clicked!");
    else if (link === "Events") setSelectedPage("events");
    else if (link === "support") showToast("Contact admin for any queries!!");
    else if (link === "Details") setSelectedPage("details");
  };

  const handleSignOut = () => {
    showToast("Sign Out clicked!");
    // Add your sign out logic here
  };

  const showToast = (msg) => {
    setToast(msg);
  };

  return (
    <div className="app-container">
      <Sidebar
        onSelectPage={setSelectedPage}
        open={sidebarOpen}
        mobileOpen={sidebarMobile}
        setOpen={setSidebarOpen}
        setMobileOpen={setSidebarMobile}
        className={sidebarMobile ? "sidebar sidebar-active" : "sidebar"}
      />
      <div className={`main-content${sidebarMobile ? " content-shift" : ""}`}>
        <header className="header">
          <div className="header__left">
            <h2>Welcome, {userName}</h2>
          </div>
          <div className="header__right">
            <span className="material-icons header__icon">notifications</span>
            <ProfileDropdown
              userName={userName}
              onMenuClicked={handleProfileMenu}
              onSignOut={handleSignOut}
            />
          </div>
        </header>
        <div className="content">
          {selectedPage === "dashboard" && <Dashboard />}
          {selectedPage === "classrooms" && <Classrooms />}
          {selectedPage === "events" && <Events />}
          {selectedPage === "details" && <Detail />}
          {selectedPage === "settings" && <Settings />}
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

export default App;
