# Calendar and Scheduling API

A RESTful API for managing calendar events and scheduling, built using Node.js, Koa, React, and MySQL.

## Project Structure

The project is organized as follows:

- `client/`: React frontend
- `server/`: Node.js/Koa backend
- `docker-compose.yml`: Docker configuration for MySQL database

## Technologies Used

### Backend

- Node.js
- Koa.js framework
- MySQL database
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing

### Frontend

- React.js
- Ant Design UI library
- Axios for API requests
- React Router for navigation

## Prerequisites

Before setting up the project, make sure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose

## Setting Up the Project

### 1. Clone the repository

```bash
git clone https://github.coventry.ac.uk/<your-username>/calendar-api.git
cd calendar-api
```

### 2. Start the MySQL database using Docker

```bash
docker-compose up -d
```

This will start a MySQL database on port 3306 with the following credentials:
- Username: calendar_user
- Password: calendar_password
- Database: calendar_db

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Install client dependencies

```bash
cd ../client
npm install
```

## Running the Application

### 1. Start the server (from the server directory)

```bash
cd ../server
npm run dev
```

The server will run on http://localhost:3001

### 2. Start the client (from the client directory)

```bash
cd ../client
npm start
```

The client will run on http://localhost:3000

## API Documentation

The API documentation is provided in OpenAPI format in the `server/src/docs/openapi.yaml` file.

## Testing

To run the API tests:

```bash
cd server
npm test
```

## Features

- User registration and authentication with JWT
- Create, read, update, and delete calendar events
- Add attendees to events
- Set reminders for events
- Recurring events

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- CORS protection

## License

This project is for educational purposes only, developed as part of the Web API Development module at Coventry University.

---

## Running in Codio

The application has been set up to run in the Codio environment. To get started:

1. Open the Codio project
2. Start the MySQL database:
   ```bash
   docker-compose up -d
   ```
3. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```
4. Install dependencies for the client:
   ```bash
   cd ../client
   npm install
   ```
5. Start the server (from the server directory):
   ```bash
   cd ../server
   npm run dev
   ```
6. Start the client (open a new terminal):
   ```bash
   cd client
   npm start
   ```

The application should now be running with:
- Server on port 3001
- Client on port 3000
- MySQL on port 3306

## Default User Credentials

For testing purposes, the following user accounts are pre-populated in the database:

1. Username: john.doe
   Password: password123

2. Username: jane.smith
   Password: password123
