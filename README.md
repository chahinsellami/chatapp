# WebChat — My First Full-Stack Project 💬

A real-time messaging platform built from scratch. Send messages instantly, make voice/video calls, manage friends, and express yourself with posts—all in one app.

> **Note:** This is my first major project as a junior developer. It may have rough edges, but I built every feature from the ground up, and I learned a LOT in the process.

**Live Demo:** [chatapp-two-drab.vercel.app](https://chatapp-two-drab.vercel.app)

## ✨ What You Can Do

- **💬 Message Friends** — Send and receive messages in real-time. See when someone is typing.
- **📞 Voice & Video Calls** — Make crystal-clear calls with automatic noise cancellation. Falls back to audio if your camera isn't available.
- **👥 Manage Friends** — Search for people, send friend requests, accept/reject them, and see who's online RIGHT NOW.
- **👤 Your Profile** — Upload a custom profile picture, add a bio, set your cover image, and see all your posts.
- **📝 Post & Share** — Create posts on your profile, add photos, and see your friends' activity.
- **🌙 Beautiful Design** — Dark theme with smooth animations that feel professional and modern.

## 🛠️ Tech Stack (What I Used & Why)

### Frontend
- **Next.js 16 & React 19** — The industry standard. Page routing is way easier than vanilla React.
- **TypeScript** — Catches bugs before runtime. Takes practice but worth it.
- **Tailwind CSS** — No more writing CSS files. Just add classes and move on.
- **Framer Motion** — Animations that don't feel janky. Makes the UI feel alive.

### Real-Time Communication
- **Socket.IO** — Keeps a persistent connection open so messages arrive instantly. No refresh needed.
- **Agora.io** — Handles all the complicated WebRTC stuff for video calls. Way better than building from scratch.

### Backend & Database
- **Node.js + Express** — Simple, fast, perfect for an API server.
- **PostgreSQL** — A proper database that keeps relationships between data clean and consistent.
- **Docker** — Makes it easy to run the backend anywhere without "works on my machine" problems.

### Storage & Deployment
- **Cloudinary** — Hosts images so my server doesn't get overloaded.
- **Vercel** — Frontend deployment in literally 3 seconds. Zero effort.
- **Railway** — Backend and database hosting that just works.

## 🎓 What I Learned

Building this project taught me things that tutorials never cover:

**Real-Time Systems**
- How to keep a WebSocket connection alive and reconnect when it drops
- Handling race conditions (what if the user sends two messages at the same time?)
- Syncing state across multiple browser tabs without getting out of sync

**Authentication & Security**
- JWTs aren't just magic tokens — they expire and need to be refreshed
- Hashing passwords with bcrypt (never, NEVER store plain text passwords)
- Input validation—gotta sanitize everything

**Database Design**
- Why relationship tables matter (one user can have many friends)
- Transactions: making sure a friend request is created both ways or not at all
- Indexes for making queries fast

**Debugging in Production**
- Console.logs get messy fast. Error tracking (Sentry) is essential.
- Testing in Staging before pushing to Production.
- How to think through "why is this happening?" without access to the user's machine

**Performance**
- React re-renders can get out of control. useCallback and useMemo are lifesavers.
- Bundling unused features wastes bandwidth. Clean up your code.
- Image optimization matters (Cloudinary handles this for me now).

## 🚀 Getting Started

### What You'll Need

- **Node.js** — [Download here](https://nodejs.org/) (Get the LTS version)
- **Git** — [Download here](https://git-scm.com/)
- **PostgreSQL** — [Download here](https://www.postgresql.org/download/) (Only if running backend locally)

### Step 1: Clone the Project

```bash
git clone https://github.com/chahinsellami/chatapp.git
cd chatapp/webchat-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all the libraries the project depends on. It'll take a minute.

### Step 3: Set Up Environment Variables

Create a file called `.env.local` in the `webchat-app` folder and add:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

> **What's this?** It tells your frontend where the backend server is running. When you push to Vercel, you'll change this to your actual backend URL.

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and you should see the login page.

### Step 5: Log In (For Testing)

Use these test credentials:
- **Email:** `test@example.com`
- **Password:** `test123`

(Only works if the database is set up. Otherwise, you'll see an error—that's expected!)

## 📂 What's in This Folder?

```
webchat-app/
├── app/                          # The actual pages & API routes
│   ├── friends/                  # Friend list and add friend page
│   ├── messenger/                # Main chat and messaging
│   ├── profile/                  # Your profile page
│   ├── settings/                 # Settings and preferences
│   ├── login/                    # Login page
│   ├── signup/                   # Sign up page
│   └── api/                      # Backend routes (handle data)
│       ├── auth/                 # Login/signup endpoints
│       ├── friends/              # Friend API endpoints
│       ├── messages/             # Message API endpoints
│       └── upload/               # Image upload endpoints
├── components/                   # Reusable React components
│   ├── Friends/                  # Chat components
│   ├── Call/                     # Video call components
│   ├── Common/                   # Buttons, inputs, etc.
│   └── Profile/                  # Profile display components
├── context/                      # Global state (logged in user, socket connection)
│   ├── AuthContext.tsx           # Handles login/logout globally
│   └── SocketContext.tsx         # Manages the real-time connection
├── lib/                          # Helper functions
│   ├── useSocket.ts              # Real-time messaging hook
│   ├── useAgoraCall.ts           # Voice/video calling logic
│   └── auth.ts                   # Password hashing & JWT stuff
└── public/                       # Images and static files
```

**Key Insight:** Most of the logic is in `app/api/*` but the UI components in `components/` call those APIs. The `context/` folder keeps things like "is the user logged in?" available everywhere.

## 🔌 How Real-Time Messaging Works

This was the trickiest part to build:

1. **User A types a message** → React calls the Socket.IO function
2. **Socket.IO sends it to the backend** → The server looks up User B's socket ID
3. **Backend sends it to User B** → B's frontend receives it instantly (no page refresh!)
4. **Message appears on B's screen** → Everything done in < 100ms

The tricky part? What if B goes offline for 10 seconds? Socket.IO reconnects automatically. And if both users go offline, messages save to the database and load when they come back.

## 📞 How Video Calls Work

I don't actually implement the complex WebRTC stuff—**Agora.io handles that**. Here's my simple flow:

1. **User A clicks "Call"** → Backend generates a special token from Agora
2. **User A joins an Agora channel** → Agora connects their camera/microphone
3. **Backend tells User B "incoming call"** → Pops up a notification
4. **User B accepts** → Also joins the Agora channel
5. **Video streams between them** → Agora's servers handle compression, echo cancellation, all of it
6. **Call ends** → Everyone leaves the Agora channel

Without Agora, this would take weeks. With it, it works perfectly and I can focus on the UI.

## ⚠️ Known Issues & Limitations

Since this is my first project, here's what I know is imperfect:

- **No real notifications** — Chat pops up on screen but your browser doesn't send OS notifications
- **No message search** — Can't search old conversations (would be a good next feature!)
- **Can't delete messages** — Only you can see them, but you can't remove them
- **Cover image sizing** — Some image aspect ratios might look weird (I'm still learning CSS!)
- **No dark/light mode toggle** — Just dark mode for now
- **Limited error handling** — If something goes really wrong, you might just see a blank screen

**These aren't bugs—they're just v1 limitations!** I'll improve them over time.

## 🔧 How to Develop This Further

Want to add a feature? Here's how to get started:

### Add a New API Endpoint

Create a file in `app/api/[feature]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
```

### Add a New Component

Create a file in `components/[Category]/YourComponent.tsx`:

```typescript
"use client";
export default function YourComponent() {
  return <div>Your UI here</div>;
}
```

### Use It in a Page

Import and use it in `app/[page]/page.tsx`:

```typescript
import YourComponent from "@/components/YourComponent";

export default function Page() {
  return <YourComponent />;
}
```

## 📊 Build & Deploy

### Build for Production

```bash
npm run build
```

This optimizes everything for speed and size.

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Click "New Project" and select your repo
4. Set root directory to `webchat-app`
5. Click Deploy
6. Done! Your site is live in < 1 minute

### Deploy Backend (if you want to)

The backend is in the `backend-server/` folder. Check that folder's README for Docker deployment.

## 🐛 Troubleshooting

**"Page shows loading spinner forever"**
- The frontend can't connect to the backend. Make sure `NEXT_PUBLIC_SOCKET_URL` in `.env.local` is correct.

**"Login page shows but no database connection error"**
- You might not have PostgreSQL running. The app has a test mode for this.

**"Messages aren't sending"**
- Backend might be down. Check if `http://localhost:3001` is running.

**"Call button is grayed out"**
- Your browser doesn't have permission to use the microphone. Check your browser settings.

**Can't figure something out?**
- I learned by reading error messages carefully, checking [Stack Overflow](https://stackoverflow.com), and asking in dev communities. It's okay to not know!

## 📚 Resources That Helped Me

- [Next.js Docs](https://nextjs.org/docs) — Official docs are straightforward
- [Socket.IO Guide](https://socket.io/docs/) — Real-time stuff explained
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Type safety isn't so scary once you get it
- [MDN Web Docs](https://developer.mozilla.org/) — For JavaScript fundamentals

## 🤝 Let's Connect

- **GitHub:** [github.com/chahinsellami/chatapp](https://github.com/chahinsellami/chatapp)
- **Issues?** [Open an issue](https://github.com/chahinsellami/chatapp/issues)
- **Feedback?** I'd love to hear what you think on LinkedIn

---

**Built with ❤️ by a junior developer who learned a lot and wants to keep learning.**

Made with Next.js, React, TypeScript, Tailwind CSS, Socket.IO, and determination.

