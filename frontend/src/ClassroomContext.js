// src/ClassroomContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import socket from './WebSocketClient';

export const ClassroomContext = createContext();

export const ClassroomProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState([]);

  // Fetch the initial classroom data from the API and load
  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/api/classrooms');
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  useEffect(() => {
    fetchClassrooms();

    // Listen to WebSocket messages for real-time updates
    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.type === 'UPDATE') {
          // Update the corresponding classroom in the state
          setClassrooms((prevClassrooms) => {
            return prevClassrooms.map((cls) =>
              cls._id === messageData.data._id ? messageData.data : cls
            );
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Clean up the event listener on unmount (optional but good practice)
    return () => {
      socket.onmessage = null;
    };
  }, []);

  return (
    <ClassroomContext.Provider value={{ classrooms, setClassrooms }}>
      {children}
    </ClassroomContext.Provider>
  );
};
