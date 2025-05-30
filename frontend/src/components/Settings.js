import React, { useState } from 'react';
import './Settings.css';
import StudentData from './StudentData'; // Fixed Import
import AdminUserPanel from './AdminUserPanel';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedOption, setSelectedOption] = useState(''); // Track selected panel

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Replace with actual credentials
    if (username === 'admin' && password === 'pass') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setSelectedOption(''); // Reset selected option
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="admin-layout">
      {!isLoggedIn ? (
        // Login Form
        <div className="admin-login-container">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username:</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="button-container">
              <button type="submit">Login</button>
            </div>
          </form>
        </div>
      ) : selectedOption === 'addStudent' ? (  
        // Show Student Data Panel
        <div className="student-data-container">
          <StudentData setView={setSelectedOption} />
          <button onClick={() => setSelectedOption('')} className="back-button">
            Back
          </button>
        </div>
      ) : selectedOption === 'adminUserModification' ? ( 
        
        <div className="student-data-container">
          <AdminUserPanel setView={setSelectedOption} />
          <button onClick={() => setSelectedOption('')} className="back-button">
            Back
          </button>
        </div>
      ) : (
        // Admin Panel
        <div className="admin-panel-wrapper">
          <div className="admin-dashboard">
            <h2 className="dashboard-title">Welcome, Admin</h2>
            <div className="dashboard-cards">
              <div className="dashboard-card glass" onClick={() => handleOptionSelect('adminUserModification')}>
                <h3>Admin Settings</h3>
                <p>Update Admin Info & Password</p>
                <button className="dashboard-btn">Go</button>
              </div>
              <div className="dashboard-card glass" onClick={() => handleOptionSelect('addStudent')}>
                <h3>Student Timetable</h3>
                <p>Manage Student Data & Rooms</p>
                <button className="dashboard-btn">Go</button>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminLogin;
