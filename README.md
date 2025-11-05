# WebChat

Professional real-time messaging application with direct messaging, friend management, and voice/video calling capabilities.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-336791?logo=postgresql)](https://railway.app/)

## Features

- **Authentication** - JWT-based secure login/signup with bcrypt password hashing
- **Direct Messaging** - Real-time one-on-one messaging with Socket.IO
- **Friend System** - Send, accept, and reject friend requests
- **Voice & Video Calls** - WebRTC-based peer-to-peer calling
- **User Profiles** - Customizable avatars (emoji & custom images), status, and bio
- **Presence Tracking** - Real-time online/offline status indicators
- **Responsive Design** - Professional dark theme with blue accents

## Tech Stack

| Technology   | Purpose             |
| ------------ | ------------------- |
| Next.js 16   | React framework     |
| TypeScript 5 | Type safety         |
| Tailwind CSS | Styling             |
| PostgreSQL   | Database            |
| Socket.IO    | Real-time messaging |
| WebRTC       | Voice/video calls   |
| Framer Motion| Animations          |

## Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Railway/local)
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp
```

2. **Install frontend dependencies**

```bash
cd webchat-app
npm install
```

3. **Install backend dependencies**

```bash
cd ../backend-server
npm install
```

4. **Configure environment variables**

Create `webchat-app/.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key_here
NODE_ENV=development
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Create `backend-server/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Running the Application

**Terminal 1 - Backend Server:**

```bash
cd backend-server
npm start
```

**Terminal 2 - Frontend App:**

```bash
cd webchat-app
npm run dev
```

**Open browser:** http://localhost:3000

## Project Structure

```
webchat/
├── webchat-app/              # Next.js frontend application
│   ├── app/                  # App router pages
│   │   ├── api/             # API routes
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── profile/         # Profile page
│   │   ├── friends/         # Friends page
│   │   └── messenger/       # Main messenger page
│   ├── components/          # React components
│   │   ├── Friends/         # Friend management components
│   │   └── Layout/          # Layout components
│   ├── context/             # React context providers
│   ├── lib/                 # Utility functions
│   └── public/              # Static assets
└── backend-server/          # Socket.IO backend server
    ├── server.js           # Main server file
    └── package.json        # Dependencies

`````

```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Friends

- `GET /api/friends` - List friends and pending requests
- `POST /api/friends` - Send friend request
- `PUT /api/friends/requests/[id]` - Accept/reject request

### Messages

- `GET /api/messages/direct/[userId]` - Get conversation
- `POST /api/messages/direct/[userId]` - Send message
- `PUT /api/messages/direct/actions/[id]` - Edit message
- `DELETE /api/messages/direct/actions/[id]` - Delete message

### Users

- `GET /api/users/search?q=query` - Search for users

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
```

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

### Deploy to Railway

1. **Backend Server**
   - Push `backend-server/` to GitHub
   - Connect to Railway
   - Set environment variables: `PORT`, `FRONTEND_URL`
   - Deploy

2. **Frontend App**
   - Push to GitHub
   - Connect to Vercel/Railway
   - Add PostgreSQL database
   - Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SOCKET_URL`
   - Deploy

## Development Scripts

```bash
# Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Backend
npm start                # Start Socket.IO server
npm run dev              # Start with nodemon (auto-reload)
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - Feel free to use for personal and commercial projects.

## Support

For questions or issues:

- Check code comments in components
- Review API documentation above
- Open a GitHub issue with details

---

**Built with Next.js, TypeScript, and PostgreSQL**
