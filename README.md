# StackIt - Real-time Question & Answer Platform

A modern, real-time question and answer platform built with React and Node.js.

## Features

- Real-time notifications for new answers
- Rich text editor for questions and answers
- User authentication and authorization
- Question tagging and search
- Answer voting and acceptance
- Responsive design

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Tiptap Editor
- **Backend**: Node.js, Express, MongoDB, Socket.io

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

4. Start the backend server:
   ```bash
   npm run start
   ```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Running the Application

1. Ensure MongoDB is running locally
2. Start the backend server (port 5000)
3. Start the frontend development server (port 5173)

## Project Structure

### Backend (`/backend`)
```
backend/
├── controllers/       # API controllers
├── middleware/        # Custom middleware
├── models/           # MongoDB models
├── routes/           # API routes
├── utils/            # Utility functions
├── server.js         # Main server file
└── .env              # Environment variables
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── api/          # API client configuration
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/         # Library configurations
│   ├── pages/       # Page components
│   ├── store/       # State management
│   ├── App.jsx      # Main app component
│   └── main.jsx     # Entry point
├── public/          # Static assets
└── index.html       # HTML template
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run start` - Start backend server
- `npm run build` - Build frontend for production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
