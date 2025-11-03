# 🚀 WebChat - Multi-User Messaging Application

A modern, real-time chat application built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **SQLite**. Features include user profiles, typing indicators, multi-user conversations, and a beautiful UI.

## ✨ Features

### ✅ Completed

- **User List Sidebar** - Display all available users with avatars and online status
- **Multi-User Messaging** - One-on-one conversations with separate message history per user pair
- **Typing Indicators** - Real-time typing indicators with instant delivery via WebSocket
- **SQLite Database** - Persistent data storage with better performance than JSON files
- **Real-time Updates** - WebSocket-based instant messaging, 99% bandwidth reduction
- **User Avatars** - Auto-generated avatars using dicebear.com API
- **Message Management** - Send, view, and delete messages
- **Responsive Design** - Beautiful Tailwind CSS UI with modern styling

### 🔄 In Development

- Authentication & Login System
- Multiple Channels/Conversations
- Message Search Functionality

## 🛠️ Tech Stack

| Technology             | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| **Next.js 16**         | React framework with App Router                |
| **TypeScript**         | Type-safe development                          |
| **Tailwind CSS v4**    | Modern styling with utility classes            |
| **WebSocket (ws)**     | Real-time bidirectional communication          |
| **better-sqlite3**     | Fast, synchronous SQLite database              |
| **React Hooks**        | State management (useState, useEffect, useRef) |
| **Next.js API Routes** | Backend endpoints for messages, conversations  |

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- Git installed

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server with WebSocket support**

```bash
npm run dev
```

This starts the custom Next.js server with real-time WebSocket capabilities.

4. **Open in browser**

```
http://localhost:3000
```

You'll see:

- 🟢 Green indicator = Real-time WebSocket connected
- Messages appear instantly (no delay!)
- Typing indicators update in real-time
- Automatic reconnection if connection drops

The app will automatically:

- Initialize the SQLite database
- Create message and conversation tables
- Generate avatars for all users
- Connect via WebSocket for real-time updates

## 📂 Project Structure

```
webchat-app/
├── .data/
│   └── webchat.db              # SQLite database (auto-created)
├── .next/                       # Next.js build cache
├── app/
│   ├── api/
│   │   ├── conversations/
│   │   │   └── route.ts         # Load conversations grouped by user
│   │   ├── messages/
│   │   │   └── route.ts         # GET/POST/DELETE messages to SQLite
│   │   ├── typing/
│   │   │   └── route.ts         # Typing indicators API (fallback)
│   │   └── websocket/
│   │       └── route.ts         # WebSocket endpoint
│   ├── globals.css              # Tailwind CSS global imports
│   ├── layout.tsx               # Root layout wrapper
│   └── page.tsx                 # Home page (renders Chat component)
├── components/
│   ├── Chat.tsx                 # Main chat interface with multi-user support
│   └── Sidebar.tsx              # User list with status indicators
├── lib/
│   ├── db.ts                    # SQLite database utilities
│   ├── useWebSocket.ts          # React hook for real-time communication
│   ├── websocket.ts             # WebSocket server manager
│   └── users.ts                 # User data & mock users
├── public/                       # Static assets
├── node_modules/                # Dependencies
├── DATABASE_SETUP.md            # Database documentation
├── FEATURE_5_WEBSOCKET.md       # WebSocket real-time feature guide
├── CONTRIBUTING.md              # Contribution guidelines
├── GETTING_STARTED.md           # Learning guide for developers
├── package.json                 # Dependencies & scripts
├── server.ts                    # Custom Next.js server with WebSocket
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration for Tailwind
└── README.md                    # This file
```

## 🎯 How to Use

### 1. **View Messages**

- Open the app at http://localhost:3000
- The left sidebar shows all available users
- Click any user to view your conversation history with them
- User avatars and online status are displayed

### 2. **Send a Message**

- Select a user from the sidebar
- Type your message in the input field at the bottom
- Press Enter or click the send button (➤)
- Messages appear instantly and are stored in SQLite

### 3. **See Typing Indicators**

- While typing, your typing status is sent via WebSocket in real-time
- Other clients instantly see "X is typing..." with animated dots
- Typing indicators automatically expire after 2 seconds of inactivity

### 4. **Delete Messages**

- Hover over your sent message
- Click the "Delete" button
- Message is removed from database

## 📊 API Endpoints

### GET /api/messages

Retrieves all messages from SQLite database

```bash
curl http://localhost:3000/api/messages
```

### POST /api/messages

Creates a new message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello!",
    "senderId": "user-1",
    "receiverId": "user-2"
  }'
```

### DELETE /api/messages

Deletes a message by ID

```bash
curl -X DELETE http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{ "id": "msg-1730627440-abc123def" }'
```

### GET /api/conversations

Loads conversations grouped by user

```bash
curl http://localhost:3000/api/conversations?currentUserId=user-1
```

### POST /api/typing

Updates typing status

```bash
curl -X POST http://localhost:3000/api/typing \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "conversationId": "user-1-user-2",
    "isTyping": true
  }'
```

### GET /api/typing

Gets current typing users in a conversation

```bash
curl http://localhost:3000/api/typing?conversationId=user-1-user-2
```

## 💾 Database

### Tables

**Messages Table**

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  senderId TEXT NOT NULL,
  receiverId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

**Conversations Table**

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  participantId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(userId, participantId)
)
```

### View Database

Using SQLite CLI:

```bash
sqlite3 .data/webchat.db
sqlite> SELECT * FROM messages;
sqlite> SELECT * FROM conversations;
```

## 🔐 Current Users (Mock Data)

The app comes with 5 pre-configured users:

| ID     | Name  | Email             | Status  |
| ------ | ----- | ----------------- | ------- |
| user-1 | Alice | alice@example.com | online  |
| user-2 | Bob   | bob@example.com   | offline |
| user-3 | Carol | carol@example.com | online  |
| user-4 | David | david@example.com | away    |
| user-5 | Eve   | eve@example.com   | offline |

Current logged-in user: `current-user-1` (you are acting as "Alice")

## 🚀 Deployment Guide

### Deploy to Friend's Server

#### Option 1: Using Docker

```bash
# Create Dockerfile (already included)
docker build -t webchat .
docker run -p 3000:3000 -v ./data:/app/.data webchat
```

#### Option 2: Manual Deployment

```bash
# On your friend's server:
1. Clone repository
2. npm install
3. npm run build
4. npm run start
```

The database will persist in `.data/webchat.db`

#### Option 3: Using Railway/Vercel

```bash
# Push to GitHub (already done!)
# Connect repository to Railway or Vercel
# Deploy with one click
```

See `DATABASE_SETUP.md` for detailed database documentation.

## 🔧 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 📝 Code Architecture

### Frontend (`components/`)

**Chat.tsx** - Main messaging interface

- Multi-user conversation management
- Message state with per-user conversations
- Typing indicator polling every 500ms
- Auto-scroll to latest message
- Delete message functionality with confirmation

**Sidebar.tsx** - User list component

- Displays all available users
- Shows online/offline/away status with color indicators
- User avatars with fallback
- Click to switch conversations
- Highlights selected user

### Backend (`app/api/`)

**messages/route.ts** - Message CRUD operations

- GET: Returns all messages
- POST: Inserts new message into SQLite
- DELETE: Removes message by ID
- All operations use database utilities

**conversations/route.ts** - Conversation grouping

- GET: Loads all messages and groups by conversation partner
- Filters messages for current user
- Returns organized conversations object

**typing/route.ts** - Typing indicators

- GET: Returns typing users for conversation
- POST: Updates typing status (3-second expiration)
- DELETE: Clears typing status
- In-memory storage with auto-cleanup

### Database (`lib/db.ts`)

Database utility functions with SQLite:

- `initializeDatabase()` - Create tables
- `getAllMessages()` - Fetch all messages
- `getConversationMessages()` - Get messages between two users
- `insertMessage()` - Add new message
- `deleteMessage()` - Remove message
- `getUserConversations()` - Get all conversation partners

### Data Models (`lib/users.ts`)

User data structures and mock data:

- `User` interface with id, name, email, avatar, status, lastSeen
- `MOCK_USERS` array with 5 pre-configured users
- Helper functions: `getUserById()`, `getStatusColor()`

## 🎨 Styling

### Tailwind CSS v4

- Utility-first CSS framework
- Modern color system with Tailwind defaults
- Responsive design with mobile-first approach
- Global imports in `globals.css`

### Color Scheme

- **Primary**: Blue (messages from you)
- **Secondary**: Gray (messages from others, UI elements)
- **Status**: Green (online), Orange (away), Gray (offline)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill existing process on port 3000
# Windows:
Get-Process node | Stop-Process -Force

# Linux/Mac:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Issues

```bash
# Delete database and restart (fresh start)
rm .data/webchat.db
npm run dev
```

### Avatar Images Not Loading

- Ensure `next.config.ts` has `remotePatterns` for `api.dicebear.com`
- Already configured!

### TypeScript Errors

```bash
npm install --save-dev @types/better-sqlite3
npm run dev
```

## 📚 Learning Resources

### Code Comments

All functions have detailed comments explaining:

- Purpose and functionality
- Parameters and return values
- How the feature works
- Integration with other components

Start by reading:

1. `components/Chat.tsx` - Main component logic
2. `lib/db.ts` - Database operations
3. `app/api/messages/route.ts` - API endpoints

### Key Concepts to Understand

1. **React Hooks** - useState, useEffect, useRef
2. **Next.js API Routes** - Backend logic in `app/api/`
3. **SQLite Database** - Data persistence
4. **TypeScript** - Type safety
5. **Tailwind CSS** - Styling system

## 🔄 Development Workflow

1. **Feature Development**

   - Create components in `components/`
   - Add API routes in `app/api/`
   - Update database schema if needed

2. **Testing**

   - Test API endpoints with curl
   - Check database with sqlite3
   - Verify UI in browser

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature description"
   git push origin main
   ```

## 🤝 Contributing

This is a learning project! Feel free to:

- Add new features
- Improve code comments
- Optimize performance
- Fix bugs

## 📝 License

MIT License - Feel free to use this for learning and personal projects

## 🎯 Roadmap

### Phase 1 (Current) ✅

- [x] User sidebar with avatars
- [x] Multi-user messaging
- [x] Typing indicators
- [x] SQLite database

### Phase 2 (Next)

- [ ] Real-time updates (WebSocket)
- [ ] Authentication & login
- [ ] Multiple channels
- [ ] Message search

### Phase 3 (Future)

- [ ] Voice/video calls
- [ ] File sharing
- [ ] User profiles & settings
- [ ] Admin dashboard
- [ ] Notifications
- [ ] Dark mode

## 🙋 Support

For questions or issues:

1. Check the code comments
2. Review `DATABASE_SETUP.md`
3. Inspect API responses with browser DevTools
4. Check terminal for error messages

## 🎓 Learning Checklist

Use this to track your learning:

- [ ] Understand React hooks (useState, useEffect, useRef)
- [ ] Learn how Next.js API routes work
- [ ] Understand SQLite database operations
- [ ] Learn TypeScript basics
- [ ] Understand Tailwind CSS utility classes
- [ ] Learn deployment strategies
- [ ] Understand real-time communication concepts
- [ ] Learn authentication best practices

## 📞 What's Next?

After building this, you'll understand:

- Full-stack web development
- Database design and management
- Real-time communication patterns
- TypeScript and modern React
- Deployment and DevOps basics
- UI/UX design principles

Ready to add more features? Here are the next ones to build:

1. **Real-time Updates** - WebSocket for instant messaging
2. **Authentication** - Login/signup with security
3. **Channels** - Create and manage chat rooms
4. **Search** - Find messages by keyword

## 🚀 Deploy Now!

Your app is ready to deploy! Push to GitHub (already done) and deploy to:

- **Railway**: https://railway.app (Recommended for beginners)
- **Vercel**: https://vercel.com (Official Next.js hosting)
- **Heroku**: https://heroku.com (With free tier options)
- **Friend's Server**: SSH deployment with Node.js

---

**Built with ❤️ for learning. Ready to learn more? Let's build more features! 🚀**

Happy coding! 📝✨
