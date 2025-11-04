# Socket.IO Messaging Debug Guide

## Issue Analysis from Terminal Logs

### What's Working ✅

- Socket.IO server is running
- Database is saving messages successfully
- Users can connect to Socket.IO
- Messages are being sent to the server

### What's NOT Working ❌

- **Messages not received by the other user**
- **Reason**: The receiver is NOT connected to Socket.IO!

### Example from Logs:

```
User user-1762252865566-2mkgopbqt joined with socket rZKHmsSm8iWv2OXAAAAC
Message received: {
  senderId: 'user-1762252865566-2mkgopbqt',
  receiverId: '0eb35718-d9ee-49f1-8def-c104808525c0',  // ← This user never joined!
  text: 'hello'
}
```

## How to Fix

### For Messaging to Work:

**BOTH users MUST:**

1. Be logged in
2. Navigate to the `/messenger` page
3. Open the DirectMessages component (select a friend to chat with)

When a user opens DirectMessages, it:

- Calls `useSocket(userId)` hook
- Connects to Socket.IO
- Sends "join" event with their userId
- Server maps userId → socketId

### Testing Steps:

#### Step 1: Open Two Browser Windows

- Window 1: Incognito/Private window
- Window 2: Normal window
- Both at `http://localhost:3000`

#### Step 2: Login as Different Users

- Window 1: Login as User A
- Window 2: Login as User B

#### Step 3: Make Sure They're Friends

- Both users should have each other as friends

#### Step 4: BOTH Open Messenger

- Window 1: Click "Messenger" → Select User B
- Window 2: Click "Messenger" → Select User A

Now check the terminal - you should see:

```
User user-xxxxx-A joined with socket ABC123
User user-xxxxx-B joined with socket DEF456
Active users: user-xxxxx-A, user-xxxxx-B
```

#### Step 5: Send Messages

- Type in either window
- Messages should appear INSTANTLY in both windows

## Common Problems

### Problem 1: "Messages not received"

**Cause**: Receiver is not on the `/messenger` page with the conversation open
**Fix**: Both users must have the chat open

### Problem 2: "Call spam in logs"

**Cause**: Fixed in latest code - `endCall` had circular dependency
**Fix**: Applied - `cleanup()` function now handles cleanup

### Problem 3: "Receiver socket: undefined"

**Cause**: Receiver's userId doesn't match what's in the Socket.IO users Map
**Check**:

- Look at terminal for "User XXX joined"
- Compare the XXX with the receiverId in "Message received"
- They must match exactly!

## Debug Checklist

When messages aren't working:

□ Is user A logged in and on `/messenger` page?
□ Is user B logged in and on `/messenger` page?
□ Did user A select user B's conversation?
□ Did user B select user A's conversation?
□ Check terminal: Do you see BOTH users joined?
□ Are the userIds in "joined" matching the sender/receiverId in messages?

## What the Logs Should Show

### Successful Message Flow:

```
✓ Socket connected: ABC123
👤 User user-A joined with socket ABC123
📊 Active users: user-A

✓ Socket connected: DEF456
👤 User user-B joined with socket DEF456
📊 Active users: user-A, user-B

📨 Message received on server: {
  from: 'user-A',
  to: 'user-B',
  text: 'hello...'
}
👤 Receiver user-B socket: DEF456
✅ Sending message to socket DEF456
```

### Failed Message Flow:

```
✓ Socket connected: ABC123
👤 User user-A joined with socket ABC123
📊 Active users: user-A

📨 Message received on server: {
  from: 'user-A',
  to: 'user-B',
  text: 'hello...'
}
👤 Receiver user-B socket: undefined  ← user-B never joined!
❌ Receiver user-B not connected
```

## Voice/Video Calls

Same principle:

- Both users must be connected via Socket.IO
- Both must have the conversation open
- One clicks 📞 or 📹
- Other sees incoming call modal
- Accept → WebRTC peer connection established

## Browser Console Logs

Open DevTools (F12) in both browser windows and check:

- `🔌 Initializing socket connection for user: XXX`
- `✅ Socket connected: ABC123`
- `📤 Sent join event with userId: XXX`
- `📨 Message received via socket: {...}`

If you DON'T see these logs, the component isn't loading properly.
