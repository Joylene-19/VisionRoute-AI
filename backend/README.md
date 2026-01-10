# VisionRoute AI - Backend API

## ✅ Module 1: User Authentication - COMPLETE

### Backend Setup Complete ✓

All authentication endpoints are ready and tested.

## 🧪 Testing the Backend API

### Using Thunder Client / Postman / VS Code REST Client

#### 1. Health Check

```http
GET http://localhost:5000/health
```

Expected Response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-04T..."
}
```

#### 2. Register New User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234",
  "currentGrade": "12th"
}
```

Expected Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    ...
  }
}
```

#### 3. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}
```

#### 4. Get Current User (Protected Route)

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 5. Update Profile

```http
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "phone": "1234567890",
  "city": "Mumbai",
  "state": "Maharashtra",
  "school": "Test School"
}
```

#### 6. Change Password

```http
PUT http://localhost:5000/api/auth/password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "Test1234",
  "newPassword": "NewPassword123"
}
```

## 📁 Backend Structure Created

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js ✅
│   │   ├── firebase.js ✅
│   │   └── gemini.js ✅
│   ├── models/
│   │   └── User.js ✅
│   ├── controllers/
│   │   └── authController.js ✅
│   ├── routes/
│   │   └── authRoutes.js ✅
│   ├── middleware/
│   │   ├── authMiddleware.js ✅
│   │   ├── errorHandler.js ✅
│   │   └── rateLimiter.js ✅
│   └── app.js ✅
├── server.js ✅
├── package.json ✅
├── .env ✅
└── .gitignore ✅
```

## 🔒 Environment Variables to Update

Edit `backend/.env` and add your real credentials:

```env
# Firebase Admin SDK
FIREBASE_PRIVATE_KEY="Your actual Firebase private key from service account"
FIREBASE_CLIENT_EMAIL="Your Firebase service account email"

# Gemini AI (if you have the key)
GEMINI_API_KEY=your_actual_gemini_key

# Cloudinary (for Module 1 profile photos)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Next Steps

Backend Module 1 is complete! Now we'll build the frontend.

Ready to proceed with frontend setup? Let me know!
