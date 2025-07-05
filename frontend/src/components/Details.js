import React from "react";
import "./Details.css";

const Detail = () => {
  return (
    <div className="detail-container">
      <h1 className="detail-title">How I Got This Idea?</h1>

      <p className="detail-text">
        One fine day, I was sitting in my class after the first hour. As the sections increased, we had to shift rooms every hour. There was no specific classroom assigned to us.
      </p>

      <p className="detail-text">
        When the next class began, subject teachers and students often asked me, "Where is the class? What period is now?" Even though they had a timetable on their phones, they still found it confusing.
      </p>

      <p className="detail-text">
        If a class was unavailable, I had to manually check every room to see if it was free or occupied. This made my work much harder and time-consuming.
      </p>

      <p className="detail-text">
        That's when I decided to create an app that could check room availability in real-time. With this app, students and teachers could instantly find out whether a classroom was free or occupied.
      </p>

      <p className="detail-text">
        Later, I realized another challenge—finding my staff for signatures. I had to search the entire department to locate them.
      </p>

      <p className="detail-text">
        To solve this, I added a staff search feature that helps locate teachers in real-time. Whether they were in a class or another location, it became easy to find them.
      </p>

      <p className="detail-text">
        Additionally, I included a feature to search for available projectors, making it easier for faculty to plan their sessions without last-minute hassles.
      </p>

      <p className="detail-highlight">And that’s how my idea was born—turning everyday struggles into a smart solution!</p>
    </div>
  );
};

export default Detail;
