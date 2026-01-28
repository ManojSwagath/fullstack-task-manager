# Full Stack Task Manager Application

A scalable REST API with Authentication & Role-Based Access Control, featuring a React frontend for task management and an **AI-powered productivity assistant**.

## 🌐 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [https://fullstack-task-manager-kappa.vercel.app](https://fullstack-task-manager-kappa.vercel.app) |
| **Backend API** | [https://fullstack-task-manager-mdhp.onrender.com/api/v1](https://fullstack-task-manager-mdhp.onrender.com/api/v1) |
| **API Docs (Swagger)** | [https://fullstack-task-manager-mdhp.onrender.com/api-docs](https://fullstack-task-manager-mdhp.onrender.com/api-docs) |

> **Note**: Backend is hosted on Render's free tier - first request may take ~30 seconds to wake up.

## 🚀 Features

### Backend
- ✅ User registration & login with password hashing (bcrypt) and JWT authentication
- ✅ Role-based access control (User vs Admin)
- ✅ CRUD APIs for Tasks entity with pagination, filtering, and search
- ✅ **AI Assistant API** powered by Groq (LLaMA 3.3 70B)
- ✅ API versioning (`/api/v1/`)
- ✅ Comprehensive error handling and input validation
- ✅ Swagger API documentation
- ✅ MongoDB Atlas cloud database
- ✅ Security features: Helmet, CORS, Rate Limiting

### Frontend
- ✅ React.js with Vite and Tailwind CSS
- ✅ User registration and login forms
- ✅ Protected dashboard with JWT authentication
- ✅ Task CRUD operations with filtering and search
- ✅ **AI Assistant** - Chat, Task Analysis, Schedule Generator
- ✅ Admin panel for user management
- ✅ Responsive design with mobile support
- ✅ Toast notifications for success/error messages

### 🤖 AI Assistant Features
- 💬 **Chat**: Conversational AI for productivity tips
- ⚡ **Task Analysis**: Get AI insights on priorities and recommendations
- 📅 **Schedule Generator**: Auto-generate daily timetables based on your tasks

## 📁 Project Structure

```
Full_stack_proj/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── swagger.js         # Swagger configuration
│   │   ├── controllers/
│   │   │   ├── authController.js  # Authentication logic
│   │   │   ├── taskController.js  # Task CRUD logic
│   │   │   ├── adminController.js # Admin operations
│   │   │   └── aiController.js    # AI Assistant (Groq)
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & RBAC
│   │   │   ├── errorHandler.js    # Global error handling
│   │   │   └── validators.js      # Input validation rules
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   └── Task.js            # Task schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Auth endpoints
│   │   │   ├── taskRoutes.js      # Task endpoints
│   │   │   ├── adminRoutes.js     # Admin endpoints
│   │   │   └── aiRoutes.js        # AI endpoints
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx         # Main layout with sidebar
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Tasks.jsx
    │   │   ├── AIAssistant.jsx    # AI Chat & Analysis
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js             # Axios API configuration
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free) or local MongoDB
- Groq API key (free) from https://console.groq.com
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` file):
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fullstack_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Groq AI API Key
GROQ_API_KEY=gsk_your_groq_api_key_here
```

4. Start the server:
```bash
# Development mode
node src/server.js

# Or with nodemon (auto-restart)
npm run dev
```

5. Access API documentation at: `http://localhost:5000/api-docs`

### Frontend Setup

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

4. Open `http://localhost:5173` in your browser

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/me` | Get current user | Yes |
| POST | `/refresh-token` | Refresh access token | No |
| POST | `/logout` | Logout user | Yes |
| PUT | `/update-profile` | Update user profile | Yes |
| PUT | `/update-password` | Update password | Yes |

### Tasks (`/api/v1/tasks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all tasks (paginated) | Yes |
| GET | `/stats` | Get task statistics | Yes |
| GET | `/:id` | Get single task | Yes |
| POST | `/` | Create new task | Yes |
| PUT | `/:id` | Update task | Yes |
| DELETE | `/:id` | Delete task | Yes |

### AI Assistant (`/api/v1/ai`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze` | Get AI task analysis & recommendations | Yes |
| POST | `/chat` | Chat with AI about productivity | Yes |
| GET | `/schedule` | Generate AI-powered daily schedule | Yes |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Dashboard statistics | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get single user | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| PUT | `/users/:id/deactivate` | Deactivate user | Admin |
| PUT | `/users/:id/activate` | Activate user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

## 🔐 Security Features

1. **Password Hashing**: Using bcrypt with salt rounds of 12
2. **JWT Authentication**: Access tokens (7d expiry) and refresh tokens (30d expiry)
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Helmet.js**: Security headers for XSS protection
5. **Input Validation**: Using express-validator for all inputs
6. **Input Sanitization**: Escaping HTML in user inputs
7. **CORS**: Configured for specific frontend origin
8. **Role-Based Access Control**: User and Admin roles

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required, max 50),
  email: String (required, unique),
  password: String (required, min 6, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required, max 100),
  description: String (max 500),
  status: String (enum: ['pending', 'in-progress', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date,
  user: ObjectId (ref: User),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Scalability Notes

### Current Architecture Supports:
1. **Horizontal Scaling**: Stateless JWT authentication allows multiple server instances
2. **Database Indexing**: Compound indexes on frequently queried fields
3. **Pagination**: All list endpoints support pagination to handle large datasets
4. **Cloud Database**: MongoDB Atlas for high availability

### Recommended for Production:

1. **Microservices Architecture**
   - Separate auth service, task service, AI service, and notification service
   - Use message queues (RabbitMQ/Redis) for inter-service communication

2. **Caching Layer**
   - Redis for session management and frequently accessed data
   - Cache task statistics and AI responses

3. **Load Balancing**
   - Use Nginx or HAProxy for distributing traffic
   - Implement health checks and auto-scaling

4. **Database Optimization**
   - MongoDB replica sets for high availability
   - Read replicas for scaling read operations
   - Consider sharding for very large datasets

5. **Containerization & Orchestration**
   - Docker for containerization
   - Kubernetes for orchestration and auto-scaling

6. **Monitoring & Logging**
   - ELK Stack (Elasticsearch, Logstash, Kibana) for centralized logging
   - Prometheus + Grafana for metrics and monitoring

## 🧪 Testing the API

### Using Swagger UI
1. Navigate to `http://localhost:5000/api-docs`
2. Register a new user via POST `/auth/register`
3. Copy the access token from the response
4. Click "Authorize" button and paste the token
5. Test all protected endpoints

### Sample API Requests

**Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Pass123"}'
```

**Create Task:**
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Complete project","priority":"high","status":"pending"}'
```

**AI Analysis:**
```bash
curl -X POST http://localhost:5000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"What should I focus on today?"}'
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (jsonwebtoken) |
| **AI** | Groq API (LLaMA 3.3 70B) |
| **API Docs** | Swagger UI |
| **Security** | Helmet, bcrypt, express-validator |

## 📝 License

ISC License

---

Built with ❤️ for the Backend Developer Internship Assignment
