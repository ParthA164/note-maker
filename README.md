# Notes App - Full Stack Note-Taking Application

A modern, full-stack note-taking application built with React TypeScript frontend and Node.js TypeScript backend, featuring user authentication, email verification, and comprehensive note management.

## 🚀 Features

### Authentication
- **Email & Password Signup/Login** with email verification via OTP
- **Google OAuth Integration** (ready for implementation)
- **JWT-based Authentication** with secure token management
- **Password Security** with bcrypt hashing
- **Email Verification** with OTP system (10-minute expiry)

### Note Management
- **Create, Read, Update, Delete** notes
- **Pin Important Notes** to keep them at the top
- **Search Functionality** across title, content, and tags
- **Tag System** for better organization
- **Real-time Updates** with optimistic UI updates
- **Note Statistics** dashboard

### UI/UX
- **Responsive Design** optimized for mobile and desktop
- **Modern Interface** built with Tailwind CSS
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Clean Typography** with Inter font family

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** with Yup validation
- **Axios** for API calls
- **React Toastify** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email sending
- **Google Auth Library** for OAuth
- **Joi** for request validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd note-taking-app
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Install dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/notes-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Email Setup Instructions

For email functionality, you need to set up Gmail App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Use this App Password in the `EMAIL_PASS` field

### 3. Frontend Setup

#### Navigate to frontend directory
```bash
cd ../frontend
```

#### Install dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Database Setup

#### Local MongoDB
Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services or run mongod.exe
```

#### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in backend `.env`

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### Production Build

#### Build Backend
```bash
cd backend
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build
```

## 📁 Project Structure

```
note-taking-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Note.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── notes.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── email.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   └── notes/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── notes.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
└── README.md
```

## 🔗 API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/resend-otp` - Resend verification OTP

### Notes Routes (Protected)
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle note pin status
- `GET /api/notes/stats/summary` - Get notes statistics

## 🔐 Authentication Flow

1. **Signup**: User provides email, password, and personal details
2. **OTP Verification**: System sends 6-digit OTP to user's email
3. **Email Verification**: User enters OTP to verify email address
4. **JWT Token**: System generates JWT token for authenticated sessions
5. **Protected Access**: JWT token required for accessing notes and user data

## 🎨 UI Components

### Common Components
- **Button** - Reusable button with variants and loading states
- **Input** - Form input with validation and error display
- **Alert** - Status messages for success, error, warning, info
- **LoadingSpinner** - Loading indicators with different sizes

### Authentication Components
- **SignupForm** - User registration with validation
- **LoginForm** - User login with error handling
- **OTPVerification** - Email verification interface

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Set environment variables

### Environment Variables for Production
- Use strong JWT secrets
- Configure proper CORS settings
- Set up SSL certificates
- Use production MongoDB instance

## 🔧 Configuration Options

### Backend Configuration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configured for frontend domain
- **Request Size**: 10MB limit for JSON requests

### Frontend Configuration
- **API Timeout**: 10 seconds
- **Token Storage**: localStorage for persistence
- **Auto-logout**: On token expiration or 401 responses

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **Email Not Sending**
   - Verify Gmail App Password
   - Check email configuration in `.env`
   - Ensure 2FA is enabled on Gmail

#### Frontend Issues
1. **API Connection Failed**
   - Check if backend server is running
   - Verify API URL in frontend `.env`
   - Check CORS configuration

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the flexible database
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors who made this project possible

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the configuration documentation

---

**Happy Note Taking! 📝✨**