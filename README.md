# 💬 WebChat - Real-Time Messaging Application# � WebChat - Real-Time Messaging Application

A modern, production-ready real-time chat application built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL on Railway**. Features direct messaging, friend management, user authentication, and a beautiful Discord-inspired UI.A modern, production-ready real-time chat application built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL on Railway**. Features direct messaging, friend management, user authentication, and a beautiful Discord-inspired UI.

[![GitHub](https://img.shields.io/badge/GitHub-chahinsellami%2Fchatapp-blue?logo=github)](https://github.com/chahinsellami/chatapp)## ✨ Features

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js)](https://nextjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)### 🎯 Core Features

[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)- **User Authentication** - Secure JWT-based login and signup

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-336791?logo=postgresql)](https://railway.app/)- **Friend Management** - Send/accept/reject friend requests

- **Direct Messaging** - One-on-one encrypted messaging with friends only

## ✨ Features- **User Profiles** - Customizable avatars, status, and bio

- **Real-time Updates** - PostgreSQL-backed message delivery

### 🎯 Core Features- **Responsive Design** - Beautiful Discord-inspired dark theme UI

- **User Authentication** - Secure JWT-based login and signup

- **Friend Management** - Send/accept/reject friend requests### 🔒 Security

- **Direct Messaging** - One-on-one messaging with friends only- Password hashing with bcrypt

- **User Profiles** - Customizable avatars, status, and bio- JWT token authentication

- **Message Management** - Send, edit, and delete messages- CORS protection

- **User Search** - Find and add new friends- Environment variable configuration

### 🔒 Security### � User Experience

- Password hashing with bcrypt- Emoji-based avatar picker (50+ options)

- JWT token authentication- Status indicators (Online, Idle, DND, Invisible)

- Environment variable configuration- Message timestamps

- Secure database connections- User search functionality

- Intuitive navigation

### 📱 User Experience

- Emoji-based avatar picker (50+ options)## 🛠️ Tech Stack

- Status indicators (Online, Idle, DND, Invisible)

- Message timestamps| Technology | Purpose |

- Intuitive navigation|-----------|---------|

- Responsive design| **Next.js 16** | React framework with App Router |

| **TypeScript 5** | Type-safe development |

## 🛠️ Tech Stack| **React 19.2** | UI library |

| **Tailwind CSS 3.3.4** | Utility-first styling |

| Technology | Purpose || **PostgreSQL** | Relational database |

|-----------|---------|| **Railway.app** | Cloud hosting |

| **Next.js 16** | React framework with App Router || **pg** | PostgreSQL client |

| **TypeScript 5** | Type-safe development || **bcrypt** | Password hashing |

| **React 19.2** | UI library || **jsonwebtoken** | Authentication |

| **Tailwind CSS 3.3.4** | Utility-first styling |

| **PostgreSQL** | Relational database |## 📦 Installation

| **Railway.app** | Cloud hosting |

| **pg** | PostgreSQL client |### Prerequisites

| **bcrypt** | Password hashing |

| **jsonwebtoken** | JWT authentication |- Node.js 18+ installed

- Git installed

## 🚀 Quick Start

### Setup Steps

### Prerequisites

- Node.js 18+1. **Clone the repository**

- npm or yarn

- PostgreSQL database (Railway.app account recommended)```bash

git clone https://github.com/chahinsellami/chatapp.git

### Installationcd chatapp

````

1. **Clone and setup**

```bash2. **Install dependencies**

git clone https://github.com/chahinsellami/chatapp.git

cd chatapp/webchat-app```bash

npm installnpm install

````

2. **Configure environment**3. **Start the development server with WebSocket support**

Create `.env.local`:

`env`bash

DATABASE_URL=postgresql://user:password@host:port/databasenpm run dev

JWT_SECRET=your_super_secret_key_here```

NODE_ENV=development

````This starts the custom Next.js server with real-time WebSocket capabilities.



3. **Start development server**4. **Open in browser**

```bash

npm run dev```

```http://localhost:3000

````

4. **Open in browser**

````You'll see:

http://localhost:3000

```- 🟢 Green indicator = Real-time WebSocket connected

- Messages appear instantly (no delay!)

## 📚 Usage Guide- Typing indicators update in real-time

- Automatic reconnection if connection drops

### 1. Create Account

- Click "Create one" on login pageThe app will automatically:

- Fill in username, email, and password

- Redirected to profile setup- Initialize the SQLite database

- Create message and conversation tables

### 2. Setup Profile- Generate avatars for all users

- Choose avatar from 50+ emoji options- Connect via WebSocket for real-time updates

- Set your status (Online/Idle/DND/Invisible)

- Add a bio (up to 150 characters)## 📂 Project Structure

- Save profile

````

### 3. Find Friendswebchat-app/

- Go to Friends section├── .data/

- Use search bar to find other users│ └── webchat.db # SQLite database (auto-created)

- Click "Add Friend" to send request├── .next/ # Next.js build cache

├── app/

### 4. Manage Requests│ ├── api/

- View pending friend requests│ │ ├── conversations/

- Accept or reject requests│ │ │ └── route.ts # Load conversations grouped by user

- Accepted friends appear in your friends list│ │ ├── messages/

│ │ │ └── route.ts # GET/POST/DELETE messages to SQLite

### 5. Send Messages│ │ ├── typing/

- Select friend from friends list│ │ │ └── route.ts # Typing indicators API (fallback)

- Type message in input field│ │ └── websocket/

- Press Enter or click send button│ │ └── route.ts # WebSocket endpoint

- Messages appear instantly│ ├── globals.css # Tailwind CSS global imports

│ ├── layout.tsx # Root layout wrapper

## 📂 Project Structure│ └── page.tsx # Home page (renders Chat component)

├── components/

````│ ├── Chat.tsx                 # Main chat interface with multi-user support

webchat-app/│   └── Sidebar.tsx              # User list with status indicators

├── app/├── lib/

│   ├── api/│   ├── db.ts                    # SQLite database utilities

│   │   ├── auth/│   ├── useWebSocket.ts          # React hook for real-time communication

│   │   │   ├── login/│   ├── websocket.ts             # WebSocket server manager

│   │   │   ├── signup/│   └── users.ts                 # User data & mock users

│   │   │   ├── me/├── public/                       # Static assets

│   │   │   └── profile/├── node_modules/                # Dependencies

│   │   ├── friends/├── DATABASE_SETUP.md            # Database documentation

│   │   │   └── requests/[requestId]/├── FEATURE_5_WEBSOCKET.md       # WebSocket real-time feature guide

│   │   ├── messages/├── CONTRIBUTING.md              # Contribution guidelines

│   │   │   ├── direct/[userId]/├── GETTING_STARTED.md           # Learning guide for developers

│   │   │   └── actions/[messageId]/├── package.json                 # Dependencies & scripts

│   │   └── users/├── server.ts                    # Custom Next.js server with WebSocket

│   │       └── search/├── tsconfig.json                # TypeScript configuration

│   ├── login/├── next.config.ts               # Next.js configuration

│   ├── signup/├── postcss.config.mjs           # PostCSS configuration for Tailwind

│   ├── profile/└── README.md                    # This file

│   ├── friends/```

│   ├── layout.tsx

│   └── page.tsx## 🎯 How to Use

├── components/

│   ├── Chat/### 1. **View Messages**

│   ├── Friends/

│   ├── Layout/- Open the app at http://localhost:3000

│   └── Sidebar.tsx- The left sidebar shows all available users

├── context/- Click any user to view your conversation history with them

│   └── AuthContext.tsx- User avatars and online status are displayed

├── lib/

│   ├── auth.ts### 2. **Send a Message**

│   ├── postgres.ts

│   └── websocket.ts- Select a user from the sidebar

├── public/- Type your message in the input field at the bottom

├── .env.local- Press Enter or click the send button (➤)

├── package.json- Messages appear instantly and are stored in SQLite

├── tsconfig.json

├── next.config.ts### 3. **See Typing Indicators**

├── tailwind.config.js

└── README.md- While typing, your typing status is sent via WebSocket in real-time

```- Other clients instantly see "X is typing..." with animated dots

- Typing indicators automatically expire after 2 seconds of inactivity

## 🔌 API Endpoints

### 4. **Delete Messages**

### Authentication

- `POST /api/auth/signup` - Create new account- Hover over your sent message

- `POST /api/auth/login` - Login with credentials- Click the "Delete" button

- `GET /api/auth/me` - Get current user- Message is removed from database

- `PUT /api/auth/profile` - Update user profile

## 📊 API Endpoints

### Friends

- `GET /api/friends` - List friends and pending requests### GET /api/messages

- `POST /api/friends` - Send friend request

- `PUT /api/friends/requests/[id]?action=accept|reject` - Accept/reject requestRetrieves all messages from SQLite database



### Messages```bash

- `GET /api/messages/direct/[userId]` - Get conversationcurl http://localhost:3000/api/messages

- `POST /api/messages/direct/[userId]` - Send message```

- `PUT /api/messages/direct/actions/[id]` - Edit message

- `DELETE /api/messages/direct/actions/[id]` - Delete message### POST /api/messages



### UsersCreates a new message

- `GET /api/users/search?q=query` - Search for users

```bash

## 🗄️ Database Schemacurl -X POST http://localhost:3000/api/messages \

  -H "Content-Type: application/json" \

### Users Table  -d '{

```sql    "text": "Hello!",

CREATE TABLE users (    "senderId": "user-1",

  id VARCHAR(36) PRIMARY KEY,    "receiverId": "user-2"

  username VARCHAR(255) UNIQUE NOT NULL,  }'

  email VARCHAR(255) UNIQUE NOT NULL,```

  password_hash VARCHAR(255) NOT NULL,

  avatar VARCHAR(255),### DELETE /api/messages

  status VARCHAR(50) DEFAULT 'offline',

  bio TEXT,Deletes a message by ID

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

)```bash

```curl -X DELETE http://localhost:3000/api/messages \

  -H "Content-Type: application/json" \

### Friends Table  -d '{ "id": "msg-1730627440-abc123def" }'

```sql```

CREATE TABLE friends (

  id VARCHAR(36) PRIMARY KEY,### GET /api/conversations

  user_id VARCHAR(36) REFERENCES users(id),

  friend_id VARCHAR(36) REFERENCES users(id),Loads conversations grouped by user

  status VARCHAR(50) DEFAULT 'accepted',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP```bash

)curl http://localhost:3000/api/conversations?currentUserId=user-1

````

### Friend Requests Table### POST /api/typing

````sql

CREATE TABLE friend_requests (Updates typing status

  id VARCHAR(36) PRIMARY KEY,

  sender_id VARCHAR(36) REFERENCES users(id),```bash

  receiver_id VARCHAR(36) REFERENCES users(id),curl -X POST http://localhost:3000/api/typing \

  status VARCHAR(50) DEFAULT 'pending',  -H "Content-Type: application/json" \

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -d '{

)    "userId": "user-1",

```    "conversationId": "user-1-user-2",

    "isTyping": true

### Direct Messages Table  }'

```sql```

CREATE TABLE direct_messages (

  id VARCHAR(36) PRIMARY KEY,### GET /api/typing

  sender_id VARCHAR(36) REFERENCES users(id),

  receiver_id VARCHAR(36) REFERENCES users(id),Gets current typing users in a conversation

  text TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,```bash

  edited_at TIMESTAMPcurl http://localhost:3000/api/typing?conversationId=user-1-user-2

)```

````

## 💾 Database

## 🔐 Authentication Flow

### Tables

1. **Signup**: User creates account → Password hashed with bcrypt → User stored in DB

2. **Login**: Email/password verified → JWT token generated → Token stored in localStorage**Messages Table**

3. **Request**: Authorization header includes JWT token

4. **Verify**: Token validated server-side → User info extracted → Access granted```sql

CREATE TABLE messages (

## 🎨 Design System id TEXT PRIMARY KEY,

text TEXT NOT NULL,

### Colors senderId TEXT NOT NULL,

- **Primary**: #5B65F5 (Blurple - Discord style) receiverId TEXT NOT NULL,

- **Background**: #36393F (Dark gray) createdAt TEXT NOT NULL,

- **Text**: #DCDDDE (Light gray) updatedAt TEXT NOT NULL

- **Accent**: #F04747 (Red - for alerts))

````

### Components

- Buttons: Discord-style with hover effects**Conversations Table**

- Input fields: Dark themed with focus states

- Cards: Rounded corners with subtle borders```sql

- Avatars: Large emoji picker with grid selectionCREATE TABLE conversations (

  id TEXT PRIMARY KEY,

## 🚀 Deployment  userId TEXT NOT NULL,

  participantId TEXT NOT NULL,

### Deploy to Railway (Recommended)  createdAt TEXT NOT NULL,

  updatedAt TEXT NOT NULL,

1. **Push to GitHub**  UNIQUE(userId, participantId)

```bash)

git add .```

git commit -m "Ready for deployment"

git push origin master### View Database

````

Using SQLite CLI:

2. **Connect to Railway**

   - Go to railway.app```bash

   - Create new project from GitHubsqlite3 .data/webchat.db

   - Select this repositorysqlite> SELECT \* FROM messages;

   - Add PostgreSQL databasesqlite> SELECT \* FROM conversations;

   - Configure environment variables```

3. **Deploy**## 🔐 Current Users (Mock Data)

   - Railway auto-deploys on push

   - View logs in dashboardThe app comes with 5 pre-configured users:

   - Access app at railway domain

| ID | Name | Email | Status |

### Deploy to Vercel| ------ | ----- | ----------------- | ------- |

| user-1 | Alice | alice@example.com | online |

1. **Import project**| user-2 | Bob | bob@example.com | offline |

   - Go to vercel.com| user-3 | Carol | carol@example.com | online |

   - Click "Import"| user-4 | David | david@example.com | away |

   - Select GitHub repository| user-5 | Eve | eve@example.com | offline |

2. **Configure**Current logged-in user: `current-user-1` (you are acting as "Alice")

   - Add DATABASE_URL env var

   - Add JWT_SECRET env var## 🚀 Deployment Guide

3. **Deploy**### Deploy to Friend's Server

   - Vercel auto-deploys

   - Connect custom domain if desired#### Option 1: Using Docker

## 🔧 Available Scripts```bash

# Create Dockerfile (already included)

````bashdocker build -t webchat .

# Developmentdocker run -p 3000:3000 -v ./data:/app/.data webchat

npm run dev              # Start dev server with hot reload```



# Production#### Option 2: Manual Deployment

npm run build           # Build for production

npm start              # Start production server```bash

# On your friend's server:

# Code Quality1. Clone repository

npm run lint           # Run ESLint2. npm install

```3. npm run build

4. npm run start

## 📝 Environment Variables```



```envThe database will persist in `.data/webchat.db`

# Database

DATABASE_URL=postgresql://user:password@host:port/database#### Option 3: Using Railway/Vercel



# Authentication```bash

JWT_SECRET=your_super_secret_key_here# Push to GitHub (already done!)

# Connect repository to Railway or Vercel

# Environment# Deploy with one click

NODE_ENV=development|production```

````

See `DATABASE_SETUP.md` for detailed database documentation.

## 🐛 Troubleshooting

## 🔧 Available Scripts

### Port Already in Use

`bash`bash

# Kill process on port 3000# Start development server with hot reload

npx kill-port 3000npm run dev

````

# Build for production

### Database Connection Errornpm run build

- Check DATABASE_URL format

- Verify PostgreSQL is running# Start production server

- Ensure database existsnpm start

- Check firewall rules

# Run ESLint

### Authentication Issuesnpm run lint

- Clear localStorage and cookies```

- Check JWT_SECRET is set

- Verify token format in headers## 📝 Code Architecture



## 🤝 Contributing### Frontend (`components/`)



Contributions welcome! **Chat.tsx** - Main messaging interface



1. Fork the repository- Multi-user conversation management

2. Create feature branch (`git checkout -b feature/amazing-feature`)- Message state with per-user conversations

3. Commit changes (`git commit -m 'Add amazing feature'`)- Typing indicator polling every 500ms

4. Push to branch (`git push origin feature/amazing-feature`)- Auto-scroll to latest message

5. Open Pull Request- Delete message functionality with confirmation



## 📋 Features Roadmap**Sidebar.tsx** - User list component



### v1.0 (Current)- Displays all available users

- ✅ User authentication- Shows online/offline/away status with color indicators

- ✅ Friend management- User avatars with fallback

- ✅ Direct messaging- Click to switch conversations

- ✅ User profiles- Highlights selected user



### v1.1 (Planned)### Backend (`app/api/`)

- [ ] WebSocket real-time updates

- [ ] Message reactions**messages/route.ts** - Message CRUD operations

- [ ] User blocking

- [ ] Message search- GET: Returns all messages

- POST: Inserts new message into SQLite

### v2.0 (Future)- DELETE: Removes message by ID

- [ ] Group chats- All operations use database utilities

- [ ] Voice/video calls

- [ ] File sharing**conversations/route.ts** - Conversation grouping

- [ ] Message encryption

- [ ] Mobile app- GET: Loads all messages and groups by conversation partner

- Filters messages for current user

## 📄 License- Returns organized conversations object



MIT License - Feel free to use for personal and commercial projects**typing/route.ts** - Typing indicators



## 🙏 Acknowledgments- GET: Returns typing users for conversation

- POST: Updates typing status (3-second expiration)

- Built with Next.js and Tailwind CSS- DELETE: Clears typing status

- Hosted on Railway.app- In-memory storage with auto-cleanup

- Inspired by Discord's UI/UX

### Database (`lib/db.ts`)

## 📞 Support

Database utility functions with SQLite:

For questions or issues:

1. Check the code comments- `initializeDatabase()` - Create tables

2. Review error messages in browser console- `getAllMessages()` - Fetch all messages

3. Check server logs- `getConversationMessages()` - Get messages between two users

4. Open GitHub issue with details- `insertMessage()` - Add new message

- `deleteMessage()` - Remove message

---- `getUserConversations()` - Get all conversation partners



**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**### Data Models (`lib/users.ts`)



[⬆ Back to top](#-webchat---real-time-messaging-application)User data structures and mock data:


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
````

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
