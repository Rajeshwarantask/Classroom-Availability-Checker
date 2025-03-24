// frontend/src/components/Dashboard.js
import React, { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    console.log("Dashboard component mounted");
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is the dashboard page content.</p>
    </div>
  );
};

export default Dashboard;

