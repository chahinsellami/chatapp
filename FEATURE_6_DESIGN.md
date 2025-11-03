# 🎮 Discord-Like Chat App - Feature 6 Design & Architecture

## Overview

Transform the current chat app into a **Discord-like** experience with:

- ✅ **Authentication System** (Login/Signup with JWT)
- ✅ **Multiple Channels** (like servers with channels)
- ✅ **User Profiles** (with real usernames and avatars)
- ✅ **Modern Discord UI** (dark theme, professional layout)
- ✅ **Real-time Features** (WebSocket + HTTP integration)

---

## 🎨 UI Layout & Components

### 1. New Layout Structure

```
┌───────────────────────────────────────────────────────────┐
│                  DISCORD-LIKE LAYOUT                      │
├─────┬────────┬──────────────────────────────┬─────────────┤
│  S  │ SERVER │         CHAT AREA            │  MEMBERS    │
│  I  │ SELECT │                              │    LIST     │
│  D  │ & CHLS │    (Messages history)        │ (Online     │
│  E  │        │                              │  users)     │
│  B  │ #general                              │             │
│  A  │ #random                               │  - Alice    │
│  R  │ #tech                                 │  - Bob      │
│     │ #gaming                               │  - Charlie  │
│     │ #memes                                │             │
│     │ ▼ Create Ch.                          │  Status 🟢  │
│     │                                        │             │
│     │ Settings                               │             │
│     │ Logout                                 │             │
└─────┴────────┴──────────────────────────────┴─────────────┘
```

### 2. Component Breakdown

| Component       | Purpose                  | Features                                             |
| --------------- | ------------------------ | ---------------------------------------------------- |
| **Sidebar**     | Server/channel selection | Expandable channels, create channel button, settings |
| **Header**      | Current channel info     | Channel name, description, member count              |
| **ChatArea**    | Message display & input  | Messages, avatars, usernames, timestamps             |
| **MembersList** | Online users             | Real-time status, user cards, click for DM           |
| **Auth Pages**  | Login/Signup             | Form validation, password strength, error handling   |
| **UserProfile** | User settings            | Avatar, username, email, logout                      |

---

## 🏗️ Architecture

### Database Schema Changes

```sql
-- NEW TABLES

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  avatar TEXT,
  status TEXT DEFAULT 'offline',
  createdAt TEXT NOT NULL
);

-- Channels table
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  isPrivate INTEGER DEFAULT 0,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(createdBy) REFERENCES users(id)
);

-- Channel members (for private channels)
CREATE TABLE channelMembers (
  channelId TEXT NOT NULL,
  userId TEXT NOT NULL,
  joinedAt TEXT NOT NULL,
  PRIMARY KEY(channelId, userId),
  FOREIGN KEY(channelId) REFERENCES channels(id),
  FOREIGN KEY(userId) REFERENCES users(id)
);

-- UPDATED TABLES

-- Messages (with user reference)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  userId TEXT NOT NULL,
  channelId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  editedAt TEXT,
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(channelId) REFERENCES channels(id)
);
```

### API Routes (New & Updated)

```
🔐 Authentication Routes:
├─ POST   /api/auth/signup          Create new account
├─ POST   /api/auth/login           Get JWT token
├─ POST   /api/auth/logout          Clear session
├─ GET    /api/auth/me              Get current user
└─ POST   /api/auth/refresh         Refresh JWT token

👥 User Routes:
├─ GET    /api/users                List all users
├─ GET    /api/users/:id            Get user profile
├─ PUT    /api/users/:id            Update user
└─ GET    /api/users/status         Get all online users

📢 Channel Routes:
├─ GET    /api/channels             List all channels
├─ POST   /api/channels             Create new channel
├─ GET    /api/channels/:id         Get channel details
├─ PUT    /api/channels/:id         Update channel
├─ DELETE /api/channels/:id         Delete channel
└─ GET    /api/channels/:id/members List channel members

💬 Message Routes:
├─ GET    /api/messages?channel=id  Get messages by channel
├─ POST   /api/messages             Create message
├─ PUT    /api/messages/:id         Edit message
├─ DELETE /api/messages/:id         Delete message
└─ GET    /api/messages/:id         Get single message

🔌 WebSocket Routes:
├─ upgrade /                        WebSocket server
└─ events: message, typing, status, userJoined, userLeft
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  SIGNUP FLOW                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. User fills signup form                              │
│    ├─ Username (unique check)                          │
│    ├─ Email (format validation)                        │
│    └─ Password (min 8 chars, uppercase, number)        │
│                                                         │
│ 2. Client sends POST /api/auth/signup                  │
│    ├─ Body: { username, email, password }             │
│    └─ No headers needed                                │
│                                                         │
│ 3. Server validates                                    │
│    ├─ Check username unique                           │
│    ├─ Check email valid & unique                      │
│    ├─ Hash password with bcrypt                       │
│    └─ Create user in database                         │
│                                                         │
│ 4. Auto-login user                                     │
│    ├─ Create JWT token: {userId, username, email}     │
│    ├─ Set httpOnly cookie: token                      │
│    └─ Return user object                              │
│                                                         │
│ 5. Client stores user context                          │
│    ├─ AuthContext: { user, token, isLoggedIn }        │
│    └─ Redirect to /channels                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  LOGIN FLOW                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. User fills login form                               │
│    ├─ Email                                            │
│    └─ Password                                         │
│                                                         │
│ 2. Client sends POST /api/auth/login                   │
│    ├─ Body: { email, password }                        │
│    └─ No headers needed                                │
│                                                         │
│ 3. Server validates                                    │
│    ├─ Find user by email                              │
│    ├─ Compare password with bcrypt                    │
│    └─ Throw 401 if invalid                            │
│                                                         │
│ 4. Create JWT token                                    │
│    ├─ Header: { alg: "HS256", typ: "JWT" }            │
│    ├─ Payload: { userId, username, email, exp }       │
│    ├─ Signature: HMAC-SHA256(secret)                  │
│    └─ Set httpOnly cookie                             │
│                                                         │
│ 5. Client redirects to chat                            │
│    └─ All requests now include Authorization header    │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              PROTECTED REQUEST FLOW                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Client makes request to /api/messages               │
│    ├─ Header: Authorization: Bearer <jwt_token>       │
│    └─ Body: { text, channelId }                        │
│                                                         │
│ 2. Server middleware checks token                      │
│    ├─ Extract token from header                        │
│    ├─ Verify signature                                │
│    ├─ Check expiration                                │
│    └─ Attach userId to request                        │
│                                                         │
│ 3. Route handler has user context                      │
│    ├─ Know who is sending the message                 │
│    ├─ Create message with userId                      │
│    └─ Broadcast via WebSocket with user info          │
│                                                         │
│ 4. Response includes user data                         │
│    ├─ Message with username                           │
│    ├─ User avatar                                     │
│    └─ Timestamp                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System

### Color Palette (Discord-inspired)

```
DARK THEME:
├─ Primary BG:     #36393F (darker gray for chat area)
├─ Secondary BG:   #2F3136 (sidebar background)
├─ Tertiary BG:    #282C34 (message area background)
├─ Accent Color:   #5B65F5 (bright blue for buttons)
├─ Text Primary:   #DCDDDE (light gray for main text)
├─ Text Secondary: #72767D (medium gray for secondary text)
├─ Online Status:  #43B581 (green)
├─ Idle Status:    #FAA61A (yellow)
├─ DND Status:     #F04747 (red)
└─ Offline Status: #747F8D (gray)

HOVER STATES:
├─ Accent Hover:   #4752C4 (darker blue)
├─ Channel Hover:  #35373B (lighter than sidebar)
└─ Message Hover:  #35373B (show edit/delete buttons)
```

### Typography

```
Headings:
├─ H1: 32px, Bold (channel name)
├─ H2: 24px, Bold (section headers)
└─ H3: 18px, Semibold (usernames)

Body:
├─ P: 14px, Regular (message text)
├─ S: 12px, Regular (timestamps, secondary info)
└─ Label: 12px, Semibold (form labels, channel names)

Font Family: 'Inter' or 'Segoe UI' (Discord uses it)
```

### Component Styles

```typescript
// Button Variants
const Button = {
  primary: "bg-[#5B65F5] text-white hover:bg-[#4752C4]",
  secondary: "bg-[#2F3136] text-[#DCDDDE] hover:bg-[#35373B]",
  danger: "bg-[#F04747] text-white hover:bg-[#D83C3E]",
};

// Input Style
const Input = {
  background: "bg-[#40444B]",
  text: "text-[#DCDDDE]",
  border: "border-[#202225]",
  focus: "focus:border-[#5B65F5]",
};

// Message Style
const Message = {
  background: "hover:bg-[#35373B]",
  text: "text-[#DCDDDE]",
  timestamp: "text-[#72767D] text-xs",
};
```

---

## 📁 File Structure

```
webchat-app/
├─ app/
│  ├─ page.tsx                    (redirect to /login if not auth)
│  ├─ login/
│  │  └─ page.tsx                (login page)
│  ├─ signup/
│  │  └─ page.tsx                (signup page)
│  ├─ channels/
│  │  ├─ page.tsx                (main chat page)
│  │  ├─ [channelId]/
│  │  │  └─ page.tsx             (specific channel)
│  │  └─ layout.tsx              (authenticated layout)
│  └─ api/
│     ├─ auth/
│     │  ├─ signup/route.ts
│     │  ├─ login/route.ts
│     │  ├─ logout/route.ts
│     │  └─ me/route.ts
│     ├─ channels/
│     │  ├─ route.ts
│     │  └─ [channelId]/route.ts
│     ├─ users/
│     │  ├─ route.ts
│     │  └─ [userId]/route.ts
│     └─ messages/
│        ├─ route.ts
│        └─ [messageId]/route.ts
├─ components/
│  ├─ Auth/
│  │  ├─ LoginForm.tsx
│  │  └─ SignupForm.tsx
│  ├─ Layout/
│  │  ├─ Sidebar.tsx             (new Discord sidebar)
│  │  ├─ Header.tsx              (channel header)
│  │  ├─ MembersList.tsx         (online users)
│  │  └─ AuthLayout.tsx          (login/signup layout)
│  └─ Chat/
│     ├─ ChatArea.tsx            (messages display)
│     ├─ MessageInput.tsx        (message input box)
│     ├─ Message.tsx             (single message component)
│     └─ ChannelSelector.tsx     (channel switcher)
├─ lib/
│  ├─ auth.ts                    (JWT creation/verification)
│  ├─ bcrypt.ts                  (password hashing)
│  ├─ db.ts                      (updated for new schema)
│  ├─ websocket.ts               (update for user integration)
│  ├─ useWebSocket.ts            (client hook)
│  └─ useAuth.ts                 (new auth context hook)
├─ context/
│  └─ AuthContext.tsx            (user & auth state management)
└─ middleware/
   └─ auth.ts                    (protect routes)
```

---

## 🔑 Key Features

### Feature 6: Authentication

- ✅ User registration with password hashing
- ✅ Login with JWT tokens
- ✅ Protected routes and API endpoints
- ✅ Session management with httpOnly cookies
- ✅ Auto-logout on token expiration

### Feature 7: Channels (Enhanced)

- ✅ Create/delete/edit channels
- ✅ Channel categories/list
- ✅ Channel permissions (future)
- ✅ Default channels (#general, #random, etc.)

### Feature 8: User Profiles

- ✅ Real usernames & avatars
- ✅ Online status indicators
- ✅ User presence via WebSocket
- ✅ Profile customization

### Real-time Features

- ✅ Live user status updates
- ✅ Real-time messages with usernames
- ✅ Typing indicators with usernames
- ✅ User joined/left notifications
- ✅ Automatic reconnection

---

## 🚀 Implementation Plan

### Phase 1: Core Auth (1-2 hours)

1. Create database schema
2. Implement signup/login API routes
3. Build auth context
4. Create LoginForm & SignupForm components

### Phase 2: UI Components (2-3 hours)

1. Build Discord-like Sidebar
2. Create Header component
3. Build MembersList
4. Update ChatArea for usernames/avatars
5. Create MessageInput component

### Phase 3: Integration (1-2 hours)

1. Add user to messages
2. Update WebSocket for user info
3. Integrate auth with protected routes
4. Real-time user status

### Phase 4: Testing & Deployment (1 hour)

1. Test auth flow
2. Test real-time features
3. Test across browsers
4. Deploy to production

---

## 📊 Timeline Estimate

- **Total**: ~5-7 hours for complete Feature 6 + redesign
- **Phase 1**: 1-2 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 1-2 hours
- **Phase 4**: 1 hour

**Status**: Ready to start! 🚀
