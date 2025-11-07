# Component Documentation

This document provides detailed information about each component in the WebChat application, including their purpose, props, state, and usage examples.

## Table of Contents

- [Layout Components](#layout-components)
  - [NavigationBar](#navigationbar)
  - [Header](#header)
  - [Sidebar](#sidebar)
- [Friend Components](#friend-components)
  - [FriendsList](#friendslist)
  - [DirectMessages](#directmessages)
  - [AddFriend](#addfriend)
- [Common Components](#common-components)
  - [Avatar](#avatar)
  - [LoadingSpinner](#loadingspinner)
- [Context Providers](#context-providers)
  - [AuthContext](#authcontext)
- [Custom Hooks](#custom-hooks)
  - [useSocket](#usesocket)
  - [useWebRTC](#usewebrtc)

---

## Layout Components

### NavigationBar

**Location:** `components/Layout/NavigationBar.tsx`

**Purpose:** Top navigation bar with search, user menu, and logout functionality.

**Features:**
- Global user search
- Profile picture display
- Status indicator
- Logout button
- Responsive design

**Props:**
```typescript
// No props - uses AuthContext internally
```

**State:**
```typescript
const [searchQuery, setSearchQuery] = useState<string>("");
const [searchResults, setSearchResults] = useState<User[]>([]);
const [isSearching, setIsSearching] = useState(false);
```

**Usage:**
```tsx
import NavigationBar from '@/components/Layout/NavigationBar';

<NavigationBar />
```

**Customization:**
- Change search delay: Modify `setTimeout` duration in search useEffect
- Add more menu items: Add buttons in the navigation bar section
- Modify search logic: Edit `/api/users/search` endpoint

---

### Header

**Location:** `components/Layout/Header.tsx`

**Purpose:** Page header with title and subtitle.

**Props:**
```typescript
interface HeaderProps {
  title: string;        // Main heading text
  subtitle?: string;    // Optional subtitle
  icon?: React.ReactNode; // Optional icon component
}
```

**Usage:**
```tsx
import Header from '@/components/Layout/Header';
import { MessageCircle } from 'lucide-react';

<Header 
  title="Messages" 
  subtitle="Chat with your friends"
  icon={<MessageCircle />}
/>
```

---

### Sidebar

**Location:** `components/Layout/Sidebar.tsx`

**Purpose:** Left navigation sidebar with page links.

**Features:**
- Active page indicator
- Icon navigation
- Smooth transitions
- Mobile responsive

**Props:**
```typescript
interface SidebarProps {
  activePage?: string; // Current active page
}
```

**Navigation Items:**
```typescript
const navItems = [
  { name: 'Messenger', icon: MessageCircle, href: '/messenger' },
  { name: 'Friends', icon: Users, href: '/friends' },
  { name: 'Profile', icon: User, href: '/profile' },
];
```

**Usage:**
```tsx
import Sidebar from '@/components/Layout/Sidebar';

<Sidebar activePage="messenger" />
```

---

## Friend Components

### FriendsList

**Location:** `components/Friends/FriendsList.tsx`

**Purpose:** Display list of friends and pending friend requests.

**Features:**
- Real-time online status
- Accept/reject friend requests
- Click to message
- Loading states
- Error handling

**Props:**
```typescript
interface FriendsListProps {
  onSelectFriend: (friend: Friend) => void; // Callback when friend is clicked
}
```

**State:**
```typescript
const [friends, setFriends] = useState<Friend[]>([]);
const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**API Calls:**
- `GET /api/friends` - Fetch friends and requests
- `PUT /api/friends/requests/[id]` - Accept/reject request

**Usage:**
```tsx
import FriendsList from '@/components/Friends/FriendsList';

<FriendsList 
  onSelectFriend={(friend) => {
    console.log('Selected:', friend);
    // Navigate to chat or update state
  }}
/>
```

**Customization:**
- Modify friend card design: Edit the motion.div in the friends map
- Add more actions: Add buttons in the friend card (e.g., video call, profile)
- Change status colors: Modify STATUS_COLORS object

---

### DirectMessages

**Location:** `components/Friends/DirectMessages.tsx`

**Purpose:** Main chat interface for direct messaging between two users.

**Features:**
- Real-time messaging via Socket.IO
- Typing indicators
- Voice/video calling via WebRTC
- Message editing/deletion
- Online status
- Mobile responsive
- Auto-scroll to new messages

**Props:**
```typescript
interface DirectMessagesProps {
  userId: string;           // Current user's ID
  friendId: string;         // Friend's user ID
  friendName: string;       // Friend's display name
  friendAvatar?: string;    // Friend's avatar (emoji or URL)
  friendStatus?: string;    // Friend's online status
}
```

**State:**
```typescript
// Messages
const [messages, setMessages] = useState<DirectMessage[]>([]);
const [messageText, setMessageText] = useState("");
const [sending, setSending] = useState(false);

// UI
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showStatusDropdown, setShowStatusDropdown] = useState(false);

// User
const [userAvatar, setUserAvatar] = useState<string>("👤");
const [isMobile, setIsMobile] = useState(false);
```

**Hooks Used:**
```typescript
const { socket, isConnected, sendMessage, sendTypingIndicator, typingUsers } = useSocket(userId);
const { isCallActive, startCall, endCall, localStream, remoteStream } = useWebRTC({ socket, userId });
```

**API Calls:**
- `GET /api/messages/direct/[userId]` - Fetch conversation history
- `POST /api/messages/direct/[userId]` - Send new message
- `PUT /api/messages/direct/actions/[id]` - Edit message
- `DELETE /api/messages/direct/actions/[id]` - Delete message

**Usage:**
```tsx
import DirectMessages from '@/components/Friends/DirectMessages';

<DirectMessages
  userId="current-user-id"
  friendId="friend-user-id"
  friendName="John Doe"
  friendAvatar="😊"
  friendStatus="online"
/>
```

**Message Flow:**
1. User types message → `setMessageText()`
2. User hits send → `handleSendMessage()`
3. Message saved to DB → `POST /api/messages/direct/[userId]`
4. Message emitted via Socket.IO → `sendMessage()`
5. Receiver gets message → `socket.on('receive-message')`
6. UI updates → `setMessages([...messages, newMessage])`

**Customization:**
- Add emoji picker: Import emoji library and add button
- Add message reactions: Extend DirectMessage interface, add reaction UI
- Add file uploads: Create upload button, integrate with Cloudinary
- Modify chat bubble design: Edit motion.div in messages map

---

### AddFriend

**Location:** `components/Friends/AddFriend.tsx`

**Purpose:** Dialog for sending friend requests to other users.

**Features:**
- User search
- Send friend request
- Validation
- Error handling

**Props:**
```typescript
interface AddFriendProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Called after successful friend request
}
```

**State:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<User[]>([]);
const [sending, setSending] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Usage:**
```tsx
import AddFriend from '@/components/Friends/AddFriend';

const [showAddFriend, setShowAddFriend] = useState(false);

<AddFriend
  isOpen={showAddFriend}
  onClose={() => setShowAddFriend(false)}
  onSuccess={() => {
    console.log('Friend request sent!');
    fetchFriends(); // Refresh friends list
  }}
/>
```

---

## Common Components

### Avatar

**Location:** `components/Common/Avatar.tsx`

**Purpose:** Display user avatar (emoji or image) with consistent styling.

**Props:**
```typescript
interface AvatarProps {
  src?: string;           // Avatar URL or emoji
  alt?: string;           // Alt text for image
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Avatar size
  status?: 'online' | 'idle' | 'dnd' | 'offline'; // Online status
  showStatus?: boolean;   // Whether to show status indicator
  className?: string;     // Additional CSS classes
}
```

**Usage:**
```tsx
import Avatar from '@/components/Common/Avatar';

// Emoji avatar
<Avatar src="😊" alt="User" size="md" />

// Image avatar with status
<Avatar 
  src="https://cloudinary.com/..." 
  alt="John Doe"
  size="lg"
  status="online"
  showStatus={true}
/>
```

**Size Reference:**
- `sm`: 32px (w-8 h-8)
- `md`: 40px (w-10 h-10)
- `lg`: 48px (w-12 h-12)
- `xl`: 64px (w-16 h-16)

---

### LoadingSpinner

**Location:** `components/Common/LoadingSpinner.tsx`

**Purpose:** Animated loading indicator.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Spinner size
  message?: string;           // Optional loading message
  fullScreen?: boolean;       // Whether to center in full screen
}
```

**Usage:**
```tsx
import LoadingSpinner from '@/components/Common/LoadingSpinner';

// Small inline spinner
<LoadingSpinner size="sm" />

// Full screen with message
<LoadingSpinner 
  size="lg" 
  message="Loading messages..." 
  fullScreen={true}
/>
```

---

## Context Providers

### AuthContext

**Location:** `context/AuthContext.tsx`

**Purpose:** Global authentication state management.

**Provides:**
```typescript
interface AuthContextType {
  user: User | null;           // Current user or null
  token: string | null;        // JWT token
  isLoading: boolean;          // Auth operation in progress
  isLoggedIn: boolean;         // Computed login status
  login: (email, password) => Promise<User>;
  signup: (username, email, password, passwordConfirm) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
```

**Usage:**
```tsx
// Wrap your app
import { AuthProvider } from '@/context/AuthContext';

<AuthProvider>
  <YourApp />
</AuthProvider>

// Use in components
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Storage:**
- Token stored in `localStorage` as `auth_token`
- Automatically validates token on app load
- Clears storage on logout

---

## Custom Hooks

### useSocket

**Location:** `lib/useSocket.ts`

**Purpose:** Manage Socket.IO connection and real-time messaging.

**Parameters:**
```typescript
useSocket(userId: string | null)
```

**Returns:**
```typescript
{
  socket: Socket | null;              // Socket.IO instance
  isConnected: boolean;               // Connection status
  messages: Message[];                // Received messages
  typingUsers: Set<string>;           // Users currently typing
  onlineUsers: Set<string>;           // Users currently online
  sendMessage: (message) => void;     // Send message function
  sendTypingIndicator: (receiverId, isTyping) => void; // Send typing indicator
}
```

**Usage:**
```tsx
import { useSocket } from '@/lib/useSocket';

function ChatComponent({ userId, friendId }) {
  const { 
    isConnected, 
    sendMessage, 
    sendTypingIndicator 
  } = useSocket(userId);
  
  const handleSend = (text: string) => {
    sendMessage({
      messageId: crypto.randomUUID(),
      senderId: userId,
      receiverId: friendId,
      text,
      createdAt: new Date().toISOString(),
    });
  };
  
  const handleTyping = (isTyping: boolean) => {
    sendTypingIndicator(friendId, isTyping);
  };
  
  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );
}
```

**Socket Events:**

**Emitted:**
- `join` - Join user's room
- `send-message` - Send a message
- `typing` - Send typing indicator

**Listened:**
- `connect` - Connection established
- `disconnect` - Connection lost
- `receive-message` - New message received
- `user-typing` - Someone is typing
- `user-online` - User came online
- `user-offline` - User went offline

---

### useWebRTC

**Location:** `lib/useWebRTC.ts`

**Purpose:** Manage WebRTC peer-to-peer voice/video calls.

**Parameters:**
```typescript
useWebRTC({ 
  socket: Socket | null, 
  userId: string | null 
})
```

**Returns:**
```typescript
{
  isCallActive: boolean;              // Whether call is active
  isIncomingCall: boolean;            // Whether there's incoming call
  callType: 'voice' | 'video' | null; // Type of call
  callerInfo: { id, name, signal } | null; // Incoming call info
  localStream: MediaStream | null;   // Local camera/mic stream
  remoteStream: MediaStream | null;  // Remote user's stream
  startCall: (receiverId, type) => void;   // Initiate call
  acceptCall: () => void;             // Accept incoming call
  rejectCall: () => void;             // Reject incoming call
  endCall: () => void;                // End active call
  toggleAudio: () => boolean;         // Mute/unmute mic
  toggleVideo: () => boolean;         // Turn camera on/off
}
```

**Usage:**
```tsx
import { useSocket } from '@/lib/useSocket';
import { useWebRTC } from '@/lib/useWebRTC';

function CallComponent({ userId, friendId }) {
  const { socket } = useSocket(userId);
  const { 
    isCallActive,
    isIncomingCall,
    callerInfo,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
  } = useWebRTC({ socket, userId });
  
  // Start video call
  const handleVideoCall = () => {
    startCall(friendId, 'video');
  };
  
  // Handle incoming call
  if (isIncomingCall && callerInfo) {
    return (
      <div>
        <p>Incoming call from {callerInfo.name}</p>
        <button onClick={acceptCall}>Accept</button>
        <button onClick={rejectCall}>Reject</button>
      </div>
    );
  }
  
  // Active call UI
  if (isCallActive) {
    return (
      <div>
        <video ref={(el) => {
          if (el && localStream) el.srcObject = localStream;
        }} autoPlay muted />
        
        <video ref={(el) => {
          if (el && remoteStream) el.srcObject = remoteStream;
        }} autoPlay />
        
        <button onClick={toggleAudio}>Toggle Mic</button>
        <button onClick={endCall}>End Call</button>
      </div>
    );
  }
  
  return (
    <button onClick={handleVideoCall}>Video Call</button>
  );
}
```

**WebRTC Flow:**

1. **Initiator (Caller):**
   - `startCall(receiverId, 'video')`
   - Get local media stream
   - Create peer connection (initiator: true)
   - Emit `call-user` with signal

2. **Receiver:**
   - Receive `incoming-call` event
   - Show accept/reject UI
   - On accept: Get local media, create peer
   - Signal back with `accept-call`

3. **Connection:**
   - Exchange ICE candidates
   - Establish peer connection
   - Stream media both ways

4. **End Call:**
   - Either party calls `endCall()`
   - Stop all media tracks
   - Destroy peer connection
   - Emit `end-call` to other user

---

## Best Practices

### Component Design
1. Keep components focused and single-purpose
2. Use TypeScript interfaces for all props
3. Document complex logic with comments
4. Handle loading and error states
5. Make components responsive

### State Management
1. Use local state for UI-only data
2. Use AuthContext for user data
3. Use custom hooks for complex logic
4. Lift state up when needed by multiple components

### Performance
1. Use `React.memo()` for expensive components
2. Debounce search inputs
3. Lazy load images
4. Optimize re-renders with `useMemo` and `useCallback`

### Error Handling
1. Always wrap API calls in try/catch
2. Show user-friendly error messages
3. Log errors to console for debugging
4. Provide retry options when appropriate

### Accessibility
1. Use semantic HTML elements
2. Add ARIA labels where needed
3. Ensure keyboard navigation works
4. Maintain sufficient color contrast

---

## Troubleshooting Components

### DirectMessages not receiving messages
**Check:**
1. Socket.IO connection status (`isConnected`)
2. Backend server running
3. NEXT_PUBLIC_SOCKET_URL correct
4. Both users in correct rooms

### WebRTC calls failing
**Check:**
1. Browser permissions granted
2. HTTPS in production (WebRTC requires secure context)
3. STUN/TURN servers accessible
4. Firewall not blocking WebRTC ports

### Avatar images not displaying
**Check:**
1. Cloudinary credentials correct
2. Image URL format valid
3. CORS headers if external images
4. File size under limits

### Friend requests not working
**Check:**
1. Database friend_requests table exists
2. User IDs are valid UUIDs
3. No duplicate requests exist
4. Foreign key constraints satisfied

---

For more information, see the main [README.md](./README.md) file.
