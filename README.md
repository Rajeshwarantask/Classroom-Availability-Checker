# Classroom Availability Checker
![image](https://github.com/user-attachments/assets/5a87c811-79db-4dc1-98a9-a6825a655580)
![image](https://github.com/user-attachments/assets/5b987893-82e1-4aaf-8e0e-5ddd2971f625)
![image](https://github.com/user-attachments/assets/7f306f3f-5d85-4506-8045-72c83422617e)
![image](https://github.com/user-attachments/assets/1ed466ad-7b10-4bc0-b2f9-4a5cf260fc30)





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
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## API Endpoints

### **Check Room Availability**
```sh
GET /api/check-availability?room={room_number}&day={day}&period={period}
