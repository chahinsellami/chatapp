# 🚀 Getting Started Guide

Welcome to WebChat! This guide will walk you through setting up the development environment and understanding the codebase.

## ⚡ Quick Start (5 minutes)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Open in Browser
Navigate to `http://localhost:3000` and you should see the chat interface!

### 3. Try It Out
- Select a user from the left sidebar
- Type a message
- Press Enter to send
- Watch messages appear instantly
- Try typing to see the typing indicator

## 📚 Understanding the Codebase

### Project Structure Overview

```
src/
├── app/              # Next.js app directory (main application)
├── components/       # React components
├── lib/             # Utility functions and database
├── public/          # Static assets
└── README.md        # Documentation
```

### Key Files to Understand

#### 1. **components/Chat.tsx** (Main Chat Interface)
This is where the magic happens! It manages:
- Multi-user conversations
- Typing indicators
- Message sending/receiving
- UI rendering

**Key sections:**
- State management (messages, typing users, selected user)
- Effects for loading conversations and polling typing status
- Message send/delete handlers
- UI with sidebar and message display

**Learn this first to understand the frontend!**

#### 2. **lib/db.ts** (Database Operations)
Database utility functions that handle:
- Creating tables on startup
- Inserting messages
- Retrieving messages
- Deleting messages

**Key functions:**
- `initializeDatabase()` - Sets up SQLite
- `insertMessage()` - Save message to database
- `getAllMessages()` - Get all messages
- `deleteMessage()` - Remove message

**Learn this to understand data persistence!**

#### 3. **app/api/messages/route.ts** (Message API)
Backend endpoints for message operations:
- GET: Retrieve all messages
- POST: Save new message
- DELETE: Remove message

**Connects the frontend to the database!**

#### 4. **lib/users.ts** (User Data)
Defines the user structure and mock data:
- User interface with properties
- MOCK_USERS array with 5 sample users
- Helper functions

**Learn the data structure here!**

## 🔍 Code Reading Order

Start by reading code in this order to understand the system:

### Step 1: User Data (5 min)
📄 `lib/users.ts`
- Understand the User interface
- See what mock users exist
- Learn helper functions

### Step 2: Database (10 min)
📄 `lib/db.ts`
- Understand SQLite schema (tables)
- Read through each database function
- See how data is stored/retrieved

### Step 3: API Endpoints (10 min)
📄 `app/api/messages/route.ts`
- See how API endpoints work
- Understand request/response flow
- Learn error handling

### Step 4: Components (15 min)
📄 `components/Sidebar.tsx`
- Simple user list display
- Understand component props and state

📄 `components/Chat.tsx`
- Main application logic
- Message management
- Typing indicators

### Step 5: Application Entry (5 min)
📄 `app/page.tsx`
- How the app is initialized
- Where Chat component is used

## 💡 Concepts to Understand

### 1. React Hooks
The app uses three main hooks:
- `useState`: Store and update data (messages, selected user, etc.)
- `useEffect`: Run code when component loads or changes
- `useRef`: Keep reference to DOM elements

Example in Chat.tsx:
```typescript
const [messages, setMessages] = useState({});  // Store messages
const [selectedUser, setSelectedUser] = useState(null);  // Track selected user
const endRef = useRef(null);  // Reference to scroll element
```

### 2. Next.js API Routes
Endpoints in `app/api/` are automatically available:
- `/api/messages` → `app/api/messages/route.ts`
- `/api/conversations` → `app/api/conversations/route.ts`
- `/api/typing` → `app/api/typing/route.ts`

### 3. SQLite Database
Data is stored in `.data/webchat.db`
- Tables: `messages`, `conversations`
- Data persists between restarts
- View with: `sqlite3 .data/webchat.db`

### 4. Tailwind CSS
Styling uses utility classes:
- `bg-blue-500` - Blue background
- `text-white` - White text
- `rounded-lg` - Rounded corners
- `flex` - Flexbox layout

## 🛠️ Common Tasks

### Send a Test Message
```typescript
// Via API
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello!',
    senderId: 'user-1',
    receiverId: 'user-2'
  })
});
```

### Query Database
```bash
sqlite3 .data/webchat.db
sqlite> SELECT * FROM messages LIMIT 5;
sqlite> SELECT COUNT(*) FROM messages;
sqlite> .quit
```

### Add a New User
Edit `lib/users.ts`:
```typescript
const MOCK_USERS: User[] = [
  // ... existing users
  {
    id: 'user-6',
    name: 'Frank',
    email: 'frank@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
    status: 'online',
    lastSeen: new Date().toISOString()
  }
];
```

### Modify Database Schema
Edit `lib/db.ts` in `initializeDatabase()`:
```typescript
database.exec(`
  CREATE TABLE IF NOT EXISTS your_table (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )
`);
```

## 🐛 Debugging Tips

### 1. Browser DevTools
- Open F12 → Console tab
- See JavaScript errors
- Check Network tab for API calls

### 2. Database Inspection
```bash
# View all messages
sqlite3 .data/webchat.db "SELECT * FROM messages;"

# View database structure
sqlite3 .data/webchat.db ".schema"
```

### 3. Server Logs
Terminal shows:
- Compilation messages
- API route hits
- Build errors
- React warnings

### 4. Add Console Logs
```typescript
console.log('Current messages:', messages);
console.log('Selected user:', selectedUserId);
```

## 📖 Additional Resources

### Documentation Files
- `README.md` - Complete documentation
- `DATABASE_SETUP.md` - Database schema details
- `CONTRIBUTING.md` - How to contribute

### Online Resources
- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [SQLite Docs](https://www.sqlite.org/docs.html)

## 🎯 Learning Path

1. **Week 1: Frontend Basics**
   - Understand React components
   - Learn Tailwind CSS basics
   - Modify Chat component styling

2. **Week 2: Backend Basics**
   - Learn Next.js API routes
   - Understand SQLite queries
   - Add new API endpoint

3. **Week 3: Full Features**
   - Modify existing features
   - Add validation logic
   - Improve error handling

4. **Week 4: New Features**
   - Add real-time updates
   - Implement authentication
   - Add message search

## ❓ Common Questions

### Q: Where are messages stored?
A: In SQLite database at `.data/webchat.db`

### Q: How do I add a new feature?
A: Follow the architecture: Create UI component → Add API endpoint → Implement database logic

### Q: Can I use a different database?
A: Yes! Replace functions in `lib/db.ts` and use any database you want

### Q: How do I deploy this?
A: See deployment section in README.md (Railway, Vercel, or your own server)

### Q: What's the difference between the files?
A: Check the "Key Files to Understand" section above

## 🚀 Next Steps

1. **Read through the code** - Start with files listed above
2. **Make a small change** - Modify a color or message text
3. **Test your change** - Refresh browser and see it work
4. **Commit to Git** - Practice version control
5. **Try a feature** - Pick something from the roadmap and build it!

## 📞 Need Help?

- Check code comments - they explain the "why"
- Review DATABASE_SETUP.md - for database questions
- Look at error messages - they tell you what's wrong
- Open an issue on GitHub - community can help

---

**Happy learning! 🎉 You're on your way to becoming a full-stack developer!**
