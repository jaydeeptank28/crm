# CRM Project

Full-stack CRM application built with:
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Project Structure

```
crm/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── config/   # Database & app configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Authentication, validation, etc.
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Entry point
│   ├── .env             # Environment variables
│   └── package.json
│
└── frontend/         # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── services/    # API calls
    │   ├── utils/       # Helper functions
    │   ├── App.jsx      # Main component
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy environment variables:
   ```bash
   copy .env.example .env
   ```

3. Update `.env` with your PostgreSQL credentials:
   ```
   DB_NAME=infycrm
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=change_this_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Copy environment variables:
   ```bash
   copy .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Application will run on http://localhost:5173

## Development

- Backend runs on port 5000
- Frontend runs on port 5173
- Frontend is configured to proxy API calls to backend

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
