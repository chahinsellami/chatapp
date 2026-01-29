# WebChat

A modern real-time messaging platform designed for seamless communication. Features instant messaging, voice/video calling, friend management, and social sharing—all wrapped in a sleek, professional interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**Live Demo:** [chatapp-two-drab.vercel.app](https://chatapp-two-drab.vercel.app)

## ✨ Features

- **Real-time Messaging** - Instant messaging with Socket.IO, typing indicators, and live presence tracking
- **Voice & Video Calls** - High-quality voice/video calling with Agora integration
- **Friend Management** - Send/accept friend requests, search users, view online status
- **User Profiles** - Customizable profiles with avatars, bios, and status updates
- **Responsive Design** - Modern dark theme with smooth Framer Motion animations

## 🛠️ Tech Stack

| Layer          | Technology                                                      |
| -------------- | --------------------------------------------------------------- |
| **Frontend**   | Next.js 16, React 19, TypeScript 5, Tailwind CSS, Framer Motion |
| **Real-time**  | Socket.IO, WebRTC, Agora RTC                                    |
| **Backend**    | Node.js, Express                                                |
| **Database**   | PostgreSQL                                                      |
| **Storage**    | Cloudinary                                                      |
| **Deployment** | Vercel, Railway                                                 |

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp/webchat-app

# Install dependencies
npm install
```

### Environment Configuration

Create `.env.local` in the `webchat-app` directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NODE_ENV=development
```

> **Note:** For development, the app uses fake authentication (test@example.com / test123) when the database is unavailable.

### Run Application

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

## 📂 Project Structure

```
webchat-app/
├── app/
│   ├── api/              # API routes and endpoints
│   ├── messenger/        # Main chat interface
│   ├── friends/          # Friend management
│   ├── profile/          # User profiles
│   ├── settings/         # User settings and preferences
│   ├── login/            # Login page
│   └── signup/           # Registration page
├── components/
│   ├── Friends/          # Chat and messaging components
│   ├── Call/             # Voice/video call components
│   ├── Common/           # Reusable UI components
│   └── Layout/           # Navigation and page layout
├── context/
│   └── AuthContext.tsx   # Global authentication state
├── lib/
│   ├── useSocket.ts      # Socket.IO integration
│   ├── useWebRTC.ts      # WebRTC calling
│   └── auth.ts           # Authentication utilities
└── public/               # Static assets
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/api/auth/signup`  | Create new account |
| POST   | `/api/auth/login`   | User login         |
| GET    | `/api/auth/me`      | Get current user   |
| PUT    | `/api/auth/profile` | Update profile     |

### Friends & Messages

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/api/friends`                  | List friends and requests |
| POST   | `/api/friends`                  | Send friend request       |
| PUT    | `/api/friends/requests/[id]`    | Accept/reject request     |
| GET    | `/api/messages/direct/[userId]` | Get conversation          |
| POST   | `/api/messages/direct/[userId]` | Send message              |

### Users

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/api/users/search` | Search users by username |
| GET    | `/api/users/[id]`   | Get user profile         |

## 💾 Database Schema

### Core Tables

**users** - User accounts and profiles

```sql
id, username, email, password_hash, avatar, bio, status, created_at
```

**friends** - Friend relationships

```sql
id, user_id, friend_id, status, created_at
```

**friend_requests** - Pending friend requests

```sql
id, sender_id, receiver_id, status, created_at
```

**direct_messages** - Conversation history

```sql
id, sender_id, receiver_id, text, created_at, edited_at
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set root directory to `webchat-app`
4. Deploy

### Backend (Railway)

1. Create Railway project
2. Add PostgreSQL database
3. Deploy backend server
4. Set environment variables

**Required Env Variables:**

```
PORT=3001
FRONTEND_URL=<your-vercel-url>
DATABASE_URL=<postgresql-connection-url>
```

## 🛠️ Development Commands

```bash
# Development
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint

# Database
npm run db:init  # Initialize database (if available)
npm run db:seed  # Seed test data (if available)
```

## 📝 Development Notes

- **Fake Authentication:** The app supports test credentials (`test@example.com` / `test123`) for development when the database is unavailable
- **Real-time Features:** Socket.IO connection URL can be configured via `NEXT_PUBLIC_SOCKET_URL`
- **Component System:** Uses dynamic imports for optimal performance with Next.js

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

**Repository:** [github.com/chahinsellami/chatapp](https://github.com/chahinsellami/chatapp)  
**Issues & Feedback:** [GitHub Issues](https://github.com/chahinsellami/chatapp/issues)
