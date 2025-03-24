# Classroom Availability Checker


## Project Overview

The **Classroom Availability Checker** is a web-based application designed to optimize classroom allotment by checking real-time availability of classrooms and faculty schedules. This system ensures efficient utilization of department resources and provides instant suggestions for alternative classrooms.

## Objective

- **Classroom Availability**: Check whether a classroom is free or occupied at a given time.
- **Faculty Status**: Identify if a faculty member is conducting a class.
- **Alternative Room Suggestions**: Suggest available classrooms when the requested room is occupied.
- **Optimized Search**: Perform parallel processing to speed up availability checks.

## Tools and Technologies

### **Frontend (React.js)**
- **React Router v6**: Handles authentication, navigation, and role-based access control.
- **Axios**: Fetches data from the backend API.
- **CSS & Bootstrap**: Enhances UI/UX with a professional look.

### **Backend (Node.js & Express)**
- **MongoDB**: Stores classroom schedules and faculty allocations.
- **Mongoose**: Manages database interactions.
- **JWT Authentication**: Secure user login with role-based access.
- **Express.js**: Handles API routing and middleware.

## Features

1. **Room Availability Check**
   - Validate room number and check its status based on schedule data.
   - Display faculty name, subject, year, and section if occupied.

2. **Alternative Room Suggestion**
   - If a room is occupied, search for available rooms in the same period.
   - Fetch room allocation data and suggest free rooms dynamically.

3. **Faculty Availability Check**
   - Identify which faculty is taking a class at a specific time.
   - Display their current class details and next free slot.

4. **Authentication & Role-Based Access Control (RBAC)**
   - Admins can update schedules and manage faculty data.
   - Teachers can check their schedules and room availability.

5. **Navigation Handling**
   - Default landing pages based on user roles.
   - Restricted access for unauthorized users (403 Forbidden page).

## API Endpoints

### **Check Room Availability**
```sh
GET /api/check-availability?room={room_number}&day={day}&period={period}
