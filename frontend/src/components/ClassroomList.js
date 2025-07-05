// src/components/ClassroomList.js
import React, { useContext } from 'react';
import { ClassroomContext } from '../ClassroomContext';

const ClassroomList = () => {
  const { classrooms } = useContext(ClassroomContext);

  return (
    <div>
      <h2>Classroom Availability</h2>
      <ul>
        {classrooms.map((classroom) => (
          <li key={classroom._id || classroom.id}>
            <strong>Room:</strong> {classroom.roomNumber} <br/>
            <span>
              Status: {classroom.occupied ? `Occupied` : 'Free'}
            </span>
            {classroom.occupied && (
              <>
                <br /><span>Year: {classroom.year}</span>
                <br /><span>Staff: {classroom.staff}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassroomList;
