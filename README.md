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

(Add screenshots of homepage, dashboard, booking page, etc.)

## Future Improvements

- Add payment gateway integration
- Add advanced search and filtering for vehicles
- Add email notifications for booking confirmations
- Deploy the application to a cloud platform
- Improve security and validation

## Author

Sanele Dlomo
