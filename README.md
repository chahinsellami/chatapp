# WebChat - Real-Time Messaging Application

Professional real-time messaging application with direct messaging, friend management, post sharing, and voice/video calling capabilities. Built with modern web technologies and optimized for both desktop and mobile devices.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-336791?logo=postgresql)](https://railway.app/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Upload-3448C5?logo=cloudinary)](https://cloudinary.com/)

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based secure authentication with HTTP-only cookies
- Bcrypt password hashing for secure storage
- Session persistence with automatic token validation
- Protected routes and API endpoints

### 💬 Real-Time Messaging
- Instant message delivery using Socket.IO WebSockets
- Typing indicators to show when someone is typing
- Message editing and deletion capabilities
- Conversation history with timestamps
- Online/offline presence indicators

### 👥 Friend Management
- Search for users by username
- Send and receive friend requests
- Accept or reject pending requests
- View all friends with status indicators
- Real-time friend status updates

### 📱 Posts & Social Features
- Create text posts with optional images
- Image upload via Cloudinary integration
- View posts on user profiles
- Like posts functionality
- Responsive post cards with modern UI

### 📞 Voice & Video Calls
- Peer-to-peer WebRTC calling (voice & video)
- Real-time audio/video streaming
- In-call controls (mute/unmute, camera on/off)
- Incoming call notifications
- Mobile-friendly call interface

### 👤 User Profiles
- Customizable profile pictures (emoji or uploaded images)
- Cover photo support
- Personal bio section
- Status indicators (Online, Idle, DND, Invisible)
- View other users' profiles and posts

### 🎨 Modern UI/UX
- Professional black theme with blue accents (#3b82f6)
- Smooth animations with Framer Motion
- Fully responsive design (mobile, tablet, desktop)
- Glass morphism effects
- Intuitive navigation and layout
- Loading states and error handling

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 19.2.0 | UI component library |
| **TypeScript** | 5.x | Static type checking |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Framer Motion** | 11.x | Animation library |
| **Socket.IO Client** | 4.8.1 | Real-time WebSocket client |
| **Simple Peer** | 9.x | WebRTC wrapper for calls |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Socket.IO Server** | 4.8.1 | WebSocket server |
| **Express** | 4.x | Not used (Next.js handles routes) |

### Database & Storage
| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | Primary database (Railway hosted) |
| **Cloudinary** | Image upload and storage |

### Deployment
| Platform | Purpose |
|----------|---------|
| **Vercel** | Frontend deployment (auto-deploy from GitHub) |
| **Railway** | Backend Socket.IO server + PostgreSQL database |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** database (local or Railway account)
- **Cloudinary** account (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp
```

### 2. Install Dependencies

**Frontend (Next.js):**
```bash
cd webchat-app
npm install
```

**Backend (Socket.IO Server):**
```bash
cd ../backend-server
npm install
```

### 3. Environment Variables

#### Frontend: `webchat-app/.env.local`

```env
# PostgreSQL Database URL (from Railway or local)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret for authentication (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary Configuration (from Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Socket.IO Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

#### Backend: `backend-server/.env`

```env
# Server Port
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Run the database initialization endpoint to create all required tables:

1. Start the frontend server (see step 5)
2. Visit: `http://localhost:3000/api/db-init`
3. This will create all necessary tables

### 5. Run the Application

**Terminal 1 - Backend Socket.IO Server:**
```bash
cd backend-server
npm start
```

**Terminal 2 - Frontend Next.js App:**
```bash
cd webchat-app
npm run dev
```

**Open your browser:**
- Frontend: http://localhost:3000
- Backend Socket.IO: http://localhost:3001

### 6. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Create an account with username, email, and password
4. You'll be automatically logged in!

## 📁 Project Structure

```
webchat/
├── webchat-app/                      # Next.js Frontend Application
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Route Handlers
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/           # POST /api/auth/login
│   │   │   │   ├── signup/          # POST /api/auth/signup
│   │   │   │   ├── me/              # GET /api/auth/me
│   │   │   │   └── profile/         # PUT /api/auth/profile
│   │   │   ├── friends/             # Friend management
│   │   │   │   ├── route.ts         # GET/POST /api/friends
│   │   │   │   └── requests/[id]/   # PUT /api/friends/requests/:id
│   │   │   ├── messages/            # Direct messaging
│   │   │   │   └── direct/          # Message CRUD operations
│   │   │   ├── posts/               # Post management
│   │   │   │   ├── route.ts         # GET/POST /api/posts
│   │   │   │   └── user/            # GET /api/posts/user
│   │   │   ├── upload/              # Image upload endpoints
│   │   │   │   └── post-image/      # POST /api/upload/post-image
│   │   │   ├── users/               # User search
│   │   │   └── db-init/             # Database initialization
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   ├── profile/                  # User profile page
│   │   │   └── [userId]/            # Other user's profile
│   │   ├── friends/                  # Friends list page
│   │   ├── messenger/                # Main messaging interface
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/                   # React Components
│   │   ├── Common/                   # Shared components
│   │   │   └── Avatar.tsx           # Avatar component
│   │   ├── Friends/                  # Friend-related components
│   │   │   ├── AddFriend.tsx        # Add friend dialog
│   │   │   ├── DirectMessages.tsx   # Chat interface
│   │   │   └── FriendsList.tsx      # Friends sidebar
│   │   └── Layout/                   # Layout components
│   │       ├── Header.tsx            # Top navigation bar
│   │       ├── Sidebar.tsx           # Left sidebar
│   │       └── MembersList.tsx       # Right members panel
│   ├── context/                      # React Context
│   │   └── AuthContext.tsx           # Authentication context
│   ├── lib/                          # Utility Libraries
│   │   ├── auth.ts                   # Auth helper functions
│   │   ├── postgres.ts               # Database connection
│   │   ├── useSocket.ts              # Socket.IO hook
│   │   └── useWebRTC.ts              # WebRTC hook
│   ├── public/                       # Static Assets
│   ├── .env.local                    # Environment variables
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── next.config.ts                # Next.js config
│
└── backend-server/                   # Socket.IO Backend Server
    ├── server.js                     # Main Socket.IO server
    ├── .env                          # Backend environment variables
    ├── package.json                  # Backend dependencies
    └── README.md                     # Backend documentation
```

````

## 🔌 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "👤",
    "status": "online"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

#### `GET /api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "avatar": "👤",
  "status": "online",
  "bio": "User bio"
}
```

#### `PUT /api/auth/profile`
Update user profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "username": "newusername",
  "bio": "Updated bio",
  "avatar": "😊",
  "status": "idle"
}
```

### Friend Management Endpoints

#### `GET /api/friends`
Get all friends and pending friend requests.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "friends": [
    {
      "id": "friend_uuid",
      "username": "friend1",
      "avatar": "😊",
      "status": "online"
    }
  ],
  "pendingRequests": [
    {
      "id": "request_uuid",
      "sender_id": "user_uuid",
      "sender_username": "sender1",
      "sender_avatar": "👋"
    }
  ]
}
```

#### `POST /api/friends`
Send a friend request to another user.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "friendId": "target_user_uuid"
}
```

#### `PUT /api/friends/requests/[requestId]`
Accept or reject a friend request.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "accept"  // or "reject"
}
```

### Messaging Endpoints

#### `GET /api/messages/direct/[userId]`
Get all messages in a conversation with a specific user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_uuid",
      "sender_id": "user_uuid",
      "receiver_id": "friend_uuid",
      "text": "Hello!",
      "created_at": "2025-01-01T12:00:00Z",
      "edited_at": null
    }
  ]
}
```

#### `POST /api/messages/direct/[userId]`
Send a new message to a user.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "text": "Hello, how are you?"
}
```

#### `PUT /api/messages/direct/actions/[messageId]`
Edit an existing message.

**Request Body:**
```json
{
  "text": "Updated message text"
}
```

#### `DELETE /api/messages/direct/actions/[messageId]`
Delete a message.

### Posts Endpoints

#### `GET /api/posts`
Get all posts or posts by a specific user.

**Query Parameters:**
- `userId` (optional): Filter posts by user ID

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_uuid",
      "user_id": "user_uuid",
      "content": "Post content",
      "image": "https://cloudinary.com/...",
      "likes": 5,
      "created_at": "2025-01-01T12:00:00Z",
      "username": "johndoe",
      "avatar": "😊"
    }
  ]
}
```

#### `POST /api/posts`
Create a new post.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "content": "My new post!",
  "image": "https://cloudinary.com/..."  // optional
}
```

#### `POST /api/upload/post-image`
Upload an image for a post.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (FormData):**
```
image: [File object]
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/..."
}
```

### User Endpoints

#### `GET /api/users/search`
Search for users by username.

**Query Parameters:**
- `q`: Search query (username)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_uuid",
      "username": "johndoe",
      "avatar": "😊",
      "status": "online"
    }
  ]
}
```

## 🗄️ Database Schema

### Users Table
Stores all user account information and profile data.

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,              -- Unique user identifier (UUID)
  username VARCHAR(255) UNIQUE NOT NULL,   -- Display name (must be unique)
  email VARCHAR(255) UNIQUE NOT NULL,      -- Email address (must be unique)
  password_hash VARCHAR(255) NOT NULL,     -- Bcrypt hashed password
  avatar VARCHAR(255) DEFAULT '👤',        -- Profile picture (emoji or URL)
  custom_avatar VARCHAR(500),              -- Cloudinary image URL
  cover_image VARCHAR(500),                -- Profile cover photo URL
  status VARCHAR(50) DEFAULT 'offline',    -- Online status (online/idle/dnd/invisible)
  bio TEXT,                                -- User biography
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Account creation time
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Friends Table
Stores accepted friend relationships between users.

```sql
CREATE TABLE friends (
  id VARCHAR(36) PRIMARY KEY,              -- Unique friendship identifier
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,    -- User 1
  friend_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,  -- User 2
  status VARCHAR(50) DEFAULT 'accepted',   -- Relationship status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When they became friends
);

-- Indexes for queries
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
```

### Friend Requests Table
Stores pending friend requests.

```sql
CREATE TABLE friend_requests (
  id VARCHAR(36) PRIMARY KEY,              -- Unique request identifier
  sender_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,    -- Who sent request
  receiver_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,  -- Who receives request
  status VARCHAR(50) DEFAULT 'pending',    -- Request status (pending/accepted/rejected)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When request was sent
);

-- Indexes for queries
CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
```

### Direct Messages Table
Stores all direct messages between users.

```sql
CREATE TABLE direct_messages (
  id VARCHAR(36) PRIMARY KEY,              -- Unique message identifier
  sender_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,    -- Who sent message
  receiver_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,  -- Who receives message
  text TEXT NOT NULL,                      -- Message content
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When message was sent
  edited_at TIMESTAMP                      -- When message was last edited (if edited)
);

-- Indexes for fetching conversations
CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_created ON direct_messages(created_at DESC);
```

### Posts Table
Stores user posts with optional images.

```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,              -- Unique post identifier
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,  -- Post author
  content TEXT NOT NULL,                   -- Post text content
  image VARCHAR(500),                      -- Optional Cloudinary image URL
  likes INTEGER DEFAULT 0,                 -- Number of likes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When post was created
  edited_at TIMESTAMP                      -- When post was last edited
);

-- Indexes for queries
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  custom_avatar VARCHAR(500),
  status VARCHAR(50) DEFAULT 'offline',
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
````

### Friends Table

```sql
CREATE TABLE friends (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id),
  friend_id VARCHAR(36) REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'accepted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Friend Requests Table

```sql
CREATE TABLE friend_requests (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) REFERENCES users(id),
  receiver_id VARCHAR(36) REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Direct Messages Table

```sql
CREATE TABLE direct_messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) REFERENCES users(id),
  receiver_id VARCHAR(36) REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP
);
```

## 🚢 Deployment Guide

### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app/)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your backend repository

3. **Configure Environment Variables**
   ```env
   PORT=3001
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

4. **Deploy**
   - Railway will auto-deploy on every push to main branch
   - Note your backend URL: `https://your-app.up.railway.app`

### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [Vercel.com](https://vercel.com/)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Select `webchat-app` as root directory

3. **Configure Environment Variables**
   ```env
   DATABASE_URL=your_railway_postgres_url
   JWT_SECRET=your_long_random_secret_key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.up.railway.app
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push to master branch

### Setup PostgreSQL on Railway

1. **Add Database**
   - In Railway project, click "New"
   - Select "Database" → "PostgreSQL"

2. **Get Connection String**
   - Click on PostgreSQL service
   - Copy "PostgreSQL Connection URL"
   - Add to Vercel environment variables as `DATABASE_URL`

3. **Initialize Database**
   - After deployment, visit: `https://your-app.vercel.app/api/db-init`
   - This creates all necessary tables

### Setup Cloudinary

1. **Create Account**
   - Go to [Cloudinary.com](https://cloudinary.com/)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret
   - Add to Vercel environment variables

3. **Create Upload Preset (Optional)**
   - Settings → Upload → Upload presets
   - Create unsigned preset for public uploads

## 🛠️ Development Scripts

### Frontend Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run TypeScript type checking
npm run type-check

# Run ESLint for code quality
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

### Backend Commands

```bash
# Start Socket.IO server
npm start

# Start with nodemon (auto-reload on changes)
npm run dev
```

## 🎨 Customization Guide

### Changing Theme Colors

Edit `webchat-app/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary accent color (currently blue)
        primary: {
          DEFAULT: '#3b82f6',  // Change this
          dark: '#2563eb',
          light: '#60a5fa',
        },
        // Add more custom colors
      },
    },
  },
}
```

### Modifying Socket.IO Server

Edit `backend-server/server.js`:

```javascript
// Change port
const PORT = process.env.PORT || 3001;

// Add custom events
io.on('connection', (socket) => {
  socket.on('custom-event', (data) => {
    // Handle custom event
  });
});
```

### Adding New API Routes

Create a new file in `app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Creating New Components

Create in `components/YourComponent/YourComponent.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function YourComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Your component code */}
    </motion.div>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

#### Socket.IO Connection Errors

**Problem:** "Socket.IO disconnected" or connection spam
**Solution:**
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Verify backend server is running
- Check CORS settings in `backend-server/server.js`

#### Database Connection Issues

**Problem:** "Database connection failed"
**Solution:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running on Railway
- Run `/api/db-init` to create tables

#### Image Upload Fails

**Problem:** "Image upload error"
**Solution:**
- Check Cloudinary credentials in `.env.local`
- Verify file size is under 10MB
- Check network connection

#### WebRTC Calls Not Working

**Problem:** Calls connect but no audio/video
**Solution:**
- Grant camera/microphone permissions in browser
- Check if other apps are using camera/mic
- Try on different network (some corporate networks block WebRTC)

### Development Tips

1. **Clear Browser Cache**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Check Browser Console**
   - Press `F12` to open DevTools
   - Look for errors in Console tab

3. **Verify Environment Variables**
   ```bash
   # In webchat-app directory
   cat .env.local
   ```

4. **Reset Database**
   - Visit `/api/db-init` to recreate tables
   - Or manually drop and recreate in Railway

## 📚 Code Documentation

All major components and functions are documented with JSDoc comments:

```typescript
/**
 * Component description
 * @param props - Component props
 * @returns JSX element
 */
```

Key files with comprehensive comments:
- `lib/useSocket.ts` - Socket.IO connection management
- `lib/useWebRTC.ts` - WebRTC call handling
- `context/AuthContext.tsx` - Authentication state
- `components/Friends/DirectMessages.tsx` - Chat interface

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/chatapp.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Describe your changes

### Code Style Guidelines

- Use TypeScript for type safety
- Follow existing naming conventions
- Add JSDoc comments for functions
- Use Tailwind CSS classes (avoid inline styles)
- Keep components small and focused
- Use meaningful variable names

## 📄 License

MIT License - Free to use for personal and commercial projects.

```
Copyright (c) 2025 WebChat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Socket.IO** - Real-time engine
- **Vercel** - Hosting platform
- **Railway** - Database & backend hosting
- **Cloudinary** - Image CDN
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library

## 📞 Support

Need help? Here are your options:

1. **Documentation** - Read the code comments in each component
2. **GitHub Issues** - [Open an issue](https://github.com/chahinsellami/chatapp/issues)
3. **Email** - Contact the maintainer

## 🗺️ Roadmap

Future features planned:

- [ ] Group chat functionality
- [ ] Message reactions (emoji)
- [ ] File sharing (documents, PDFs)
- [ ] Voice messages
- [ ] Push notifications
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Dark/Light theme toggle
- [ ] Message search
- [ ] Chat archives
- [ ] User blocking
- [ ] Admin dashboard

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**

**Live Demo:** [https://chatapp-two-drab.vercel.app](https://chatapp-two-drab.vercel.app)

**Repository:** [https://github.com/chahinsellami/chatapp](https://github.com/chahinsellami/chatapp)
