# Listify

Listify is a web application for creating, managing, and sharing listings in a simple and structured way. It is built with a modern full-stack architecture, separating frontend and backend for better scalability and maintainability.

## Features

- Create and manage listings
- Real-time chat between users
- User authentication and authorization
- Image upload support via external storage (Cloudinary)
- RESTful API backend
- Responsive UI for desktop and mobile
- Clean separation between frontend and backend services

## Tech Stack

**Backend:**
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server 
- SignalR 
- JWT Authentication

**Frontend:**
- React / Vite 
- TypeScript 
- Chakra UI

**Other:**
- Cloudinary (image storage)
- Git for version control

## Architecture Overview

The project follows a client-server architecture:

- Frontend communicates with backend via REST API
- Real-time chat is handled via SignalR connections
- Backend handles business logic and data persistence
- External services are used for file storage and optional integrations

## Future Improvements

- Notifications system
- Message history optimization for chat
- Performance improvements and caching

## Notes

This project was built as a learning and portfolio application, focusing on full-stack development, real-time communication, and clean architecture principles.
