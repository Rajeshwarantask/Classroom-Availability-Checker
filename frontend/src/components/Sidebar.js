// src/components/Sidebar.js
import React from "react";
import "./Sidebar.css";

const Sidebar = ({ onSelectPage, open, mobileOpen, setOpen, setMobileOpen }) => {
  // Sidebar links
  const links = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "classrooms", icon: "school", label: "Classrooms" },
    { key: "events", icon: "event", label: "Events" },
    { key: "details", icon: "info", label: "Details" },
    { key: "settings", icon: "settings", label: "Settings" },
  ];

  // Sidebar classes
  let sidebarClass = "sidebar";
  if (!open) sidebarClass += " collapsed";
  if (mobileOpen) sidebarClass += " mobile-open";

  return (
    <>
      <div className={sidebarClass}>
        <div className="sidebar__top">
          <h2 className="sidebar__title">{open ? "Classroom Checker" : <span className="material-icons">school</span>}</h2>
          {/* Collapse/Expand button for desktop */}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="material-icons">{open ? "chevron_left" : "chevron_right"}</span>
          </button>
          {/* Close button for mobile */}
          <button
            className="sidebar-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <ul className="sidebar__nav">
          {links.map((link) => (
            <li
              key={link.key}
              onClick={() => {
                onSelectPage(link.key);
                setMobileOpen(false); // close on mobile after click
              }}
              className="sidebar__nav-item"
              title={open ? "" : link.label}
            >
              <span className="material-icons">{link.icon}</span>
              {open && <span className="sidebar__label">{link.label}</span>}
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
};

export default Sidebar;
