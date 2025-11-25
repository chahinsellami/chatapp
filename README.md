
# WebChat

A professional real-time messaging platform with direct messaging, friend management, post sharing, and secure voice/video calling powered by Agora. Built with Next.js, TypeScript, and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-336791?logo=postgresql)](https://railway.app/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io/)

**Live Demo:** [chatapp-two-drab.vercel.app](https://chatapp-two-drab.vercel.app)

## Features

- **Real-time Messaging** - Instant messaging with Socket.IO, typing indicators, and presence tracking
- **Voice & Video Calls** - Secure, production-grade voice/video calls powered by Agora
- **Friend System** - Send/accept friend requests, search users, view online status
- **Posts** - Create and share posts with image uploads via Cloudinary
- **Authentication** - JWT-based auth with bcrypt password hashing
- **Responsive UI** - Modern dark theme with Framer Motion animations

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS, Framer Motion  
**Backend:** Socket.IO 4.8, Node.js  
**Database:** PostgreSQL (Railway)  
**Storage:** Cloudinary  
**Deployment:** Vercel (Frontend), Railway (Backend + Database)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (free tier)

### Installation

```bash
# Clone repository
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp

# Install frontend dependencies
cd webchat-app
npm install

# Install backend dependencies
cd ../backend-server
npm install
```

### Environment Setup

**Frontend** (`webchat-app/.env.local`):

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_secret_key_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

**Backend** (`backend-server/.env`):

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Run Application

```bash
# Terminal 1 - Backend
cd backend-server
npm start

# Terminal 2 - Frontend
cd webchat-app
npm run dev
```

Visit **http://localhost:3000** and create your account!

## Project Structure

```
webchat-app/
├── app/
│   ├── api/              # API endpoints (auth, friends, messages, posts)
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── messenger/        # Main chat interface
│   ├── friends/          # Friends management
│   └── profile/          # User profiles
├── components/
│   ├── Friends/          # Chat components (DirectMessages, FriendsList)
│   └── Layout/           # Navigation and layout
├── context/
│   └── AuthContext.tsx   # Authentication provider
├── lib/
│   ├── useSocket.ts      # Socket.IO hook
│   ├── useWebRTC.ts      # WebRTC calling hook
│   └── postgres.ts       # Database connection
└── public/               # Static assets

backend-server/
└── server.js             # Socket.IO server
```

````

## API Reference

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Friends
- `GET /api/friends` - List friends and requests
- `POST /api/friends` - Send friend request
- `PUT /api/friends/requests/[id]` - Accept/reject request

### Messages
- `GET /api/messages/direct/[userId]` - Get conversation
- `POST /api/messages/direct/[userId]` - Send message
- `PUT /api/messages/direct/actions/[id]` - Edit message
- `DELETE /api/messages/direct/actions/[id]` - Delete message

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `POST /api/upload/post-image` - Upload image

### Users
- `GET /api/users/search?q=query` - Search users

## Database Schema

### Users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT '👤',
  custom_avatar VARCHAR(500),
  cover_image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'offline',
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Friends
```sql
CREATE TABLE friends (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  friend_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'accepted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Friend Requests
```sql
CREATE TABLE friend_requests (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  receiver_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Direct Messages
```sql
CREATE TABLE direct_messages (
  id VARCHAR(36) PRIMARY KEY,
  sender_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  receiver_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP
);
```

### Posts
```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image VARCHAR(500),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP
);
```

**Initialize Database:** Visit `/api/db-init` after deployment to create all tables.

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

## Deployment

### Railway (Backend + Database)

1. Create Railway account and new project
2. Add PostgreSQL database service
3. Deploy backend from GitHub repository
4. Set environment variables:
   ```
   PORT=3001
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Copy PostgreSQL connection URL and backend URL

### Vercel (Frontend)

1. Create Vercel account
2. Import your GitHub repository
3. Set root directory to `webchat-app`
4. Add environment variables:
   ```
   DATABASE_URL=<from Railway>
   JWT_SECRET=<random secret key>
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<from Cloudinary>
   CLOUDINARY_API_KEY=<from Cloudinary>
   CLOUDINARY_API_SECRET=<from Cloudinary>
   NEXT_PUBLIC_SOCKET_URL=<Railway backend URL>
   NODE_ENV=production
   ```
5. Deploy
6. Visit `/api/db-init` to initialize database tables

## Development

```bash
# Frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter

# Backend
npm start        # Start Socket.IO server
npm run dev      # Start with auto-reload
```

## Troubleshooting

**Socket.IO Connection Issues**

- Verify `NEXT_PUBLIC_SOCKET_URL` matches backend URL
- Check backend server is running
- Review CORS settings in backend

**Database Errors**

- Confirm `DATABASE_URL` is correct
- Run `/api/db-init` to create tables
- Check PostgreSQL service is active

**Image Upload Fails**

- Verify Cloudinary credentials
- Check file size < 10MB
- Ensure proper FormData format

**Voice/Video Calls Not Working**

- Grant browser camera/microphone permissions
- Check if device is available
- Ensure you have a stable internet connection
- If issues persist, check Agora dashboard for service status

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

---

**Repository:** [github.com/chahinsellami/chatapp](https://github.com/chahinsellami/chatapp)  
**Live Demo:** [chatapp-two-drab.vercel.app](https://chatapp-two-drab.vercel.app)
