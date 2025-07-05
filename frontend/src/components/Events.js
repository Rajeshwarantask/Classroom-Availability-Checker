import React, { useState } from "react";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);

  const [newEvent, setNewEvent] = useState({
    image: "",
    description: "",
    deadline: "",
  });

  // Convert uploaded image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, image: reader.result });
      };
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Add event
  const handleAddEvent = () => {
    if (newEvent.image && newEvent.description && newEvent.deadline) {
      setEvents([...events, { ...newEvent, expanded: false }]);
      setNewEvent({ image: "", description: "", deadline: "" }); // Reset form
    } else {
      alert("Please fill in all fields before adding an event.");
    }
  };

  // Delete event
  const handleDelete = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
  };

  // Toggle description expansion
  const toggleReadMore = (index) => {
    setEvents((prevEvents) =>
      prevEvents.map((event, i) =>
        i === index ? { ...event, expanded: !event.expanded } : event
      )
    );
  };

  return (
    <div> {/* Wrap the whole component in a div */}
      <div className="events-container">
        <h2 className="events-title">EVENTS</h2>

        {/* Event Form */}
        <div className="event-form">
          <input type="file" accept="image/*" className= "custom-file-upload" onChange={handleImageUpload} />
          <input
            type="text"
            name="description"
            placeholder="Event Description"
            value={newEvent.description}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="deadline"
            value={newEvent.deadline}
            onChange={handleInputChange}
          />
          <button onClick={handleAddEvent}>Add Event</button>
        </div>
      </div>

      {/* Event List Container */}
      <div className="events-list-container">
        <div className="events-list">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className={`event-card ${event.expanded ? "expanded" : ""}`}>
                {event.image && <img src={event.image} alt="Event" className="event-image" />}
                <p className={`event-description ${event.expanded ? "full-text" : ""}`}>
                  {event.description}
                </p>
                <p className="event-deadline">
                  <strong>Deadline:</strong> {event.deadline}
                </p>
                <div className="event-actions">
                  <button className="read-more" onClick={() => toggleReadMore(index)}>
                    {event.expanded ? "Read Less" : "Read More"}
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(index)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No events available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;