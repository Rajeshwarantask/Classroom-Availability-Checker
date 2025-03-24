// src/components/Settings.js
import React, { useState } from 'react';
import './Settings.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ' ' && password === ' ') {////password
      setIsLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="admin-layout">
      {!isLoggedIn ? (
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
      ) : (
        <div className="admin-panel-wrapper">
          <div className="admin-panel duplicated">
            <h3>Admin Panel</h3>
            <p>Modify Admin Password and Update Admin Data.</p>
            <button className="settings-button">Go to Settings</button>
          </div>
          <div className="admin-panel">
            <h3>Student Timetable Panel</h3>
            <p>Modify Student Timetable and Allocated Rooms</p>
            <button className="settings-button">Go to Settings</button>
          </div>
          <button onClick={handleLogout} className="back-button">Back to Login</button>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;