import React from 'react';
import './AdminUserPanel.css'; // Import CSS for styling

const AdminUserPanel = ({ setView }) => {
  return (
    <div className="admin-user-container">
      <h1>Admin User Panel</h1>
      <div className="options-buttons">
        <button onClick={() => alert('Modify Admin Clicked')}>Modify Admin</button>
        <button onClick={() => alert('Change Password Clicked')}>Change Password</button>
      </div>
    </div>
  );
};

export default AdminUserPanel;
