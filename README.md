# Safari Wheels Car Rental System

Safari Wheels Car Rental System is a professional full-stack car rental e-commerce platform built for portfolio demonstration.

## Overview

This system allows customers to browse vehicles, create rental reservations and manage bookings through a responsive React frontend. The backend is implemented as an ASP.NET Web API that exposes REST endpoints for vehicle browsing, rentals, user management, messages and admin operations.

## Features

- User registration and authentication
- Customer profile and rental management
- Vehicle browsing and details viewing
- Vehicle availability checking
- Car booking/reservation system
- Rental record management
- Admin dashboard and analytics endpoints
- Contact form and support message handling
- REST API backend with secure data flow
- Responsive user interface built with React and Tailwind CSS

## Technologies Used

### Frontend
- React.js
- HTML
- CSS
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Recharts
- Leaflet
- jsPDF
- xlsx

### Backend
- ASP.NET Core / .NET
- C#
- REST API
- Entity Framework Core
- JWT Authentication
- Swagger

### Database
- SQL Server / LocalDB (configured in `backend/appsettings.json`)

### Tools
- Git
- GitHub
- Visual Studio Code / Visual Studio

## System Architecture

Frontend
    |
    |  REST API
    |
Backend
    |
    |  Data access and business logic
    |
Database

Data flows from the React frontend to the backend API over HTTP. The backend handles authentication, request validation, and database operations, then returns JSON responses to the client.

## Project Structure

- `frontend/` - React application source, public assets, and frontend dependencies.
- `backend/` - ASP.NET Web API project, controllers, models, data layer, and configuration.

## Installation and Setup

### Frontend

1. Open a terminal in `frontend/`
2. Run `npm install`
3. Run `npm start`

### Backend

1. Open the solution in Visual Studio or use the terminal in `backend/`
2. Run `dotnet restore`
3. Configure the database connection in `backend/appsettings.json` if needed
4. Run `dotnet run`

## Screenshots

<img width="1677" height="752" alt="Screenshot 2026-05-08 023202" src="https://github.com/user-attachments/assets/4eb3ceae-1d15-45ac-bf5c-1f38ab178add" />
<img width="1560" height="825" alt="Screenshot 2026-05-08 023417" src="https://github.com/user-attachments/assets/d5e3bce6-9492-4750-bc74-8e063092cb79" />
<img width="919" height="713" alt="Screenshot 2026-05-08 023511" src="https://github.com/user-attachments/assets/cfbd1021-2411-48f8-a57d-dc0d22e0196b" />
<img width="1642" height="913" alt="Screenshot 2026-05-08 023632" src="https://github.com/user-attachments/assets/2e168acf-67ec-410f-994c-316fc3df4b55" />


## Future Improvements

- Add payment gateway integration
- Add advanced search and filtering for vehicles
- Add email notifications for booking confirmations
- Deploy the application to a cloud platform
- Improve security and validation

## Author

Sanele Dlomo
