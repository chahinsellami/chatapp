# 🧪 Complete Testing Guide

## Server Status
✅ **Server is running on http://localhost:3000**  
✅ **Socket.IO is ready at http://localhost:3000/socket.io/**

---

## 📝 Testing Checklist

### Part 1: Setup (5 minutes)

#### Step 1: Open Two Browser Windows
- **Window 1**: Regular Chrome/Edge window
- **Window 2**: Incognito/Private window (Ctrl+Shift+N)

**Why?** You need separate sessions to test real-time messaging between two users.

#### Step 2: Create/Login Users
**Window 1:**
1. Go to http://localhost:3000
2. If you don't have an account: Click "Sign Up" → Create User A
3. If you have an account: Login as User A

**Window 2:**
1. Go to http://localhost:3000
2. Click "Sign Up" → Create User B (or login as existing User B)

#### Step 3: Add Each Other as Friends
**Window 1 (User A):**
1. Click "Friends" in navigation
2. Use "Add Friend" to search for User B's username
3. Send friend request

**Window 2 (User B):**
1. Go to "Friends"
2. See friend request from User A
3. Accept it

---

### Part 2: Testing Real-Time Messaging (10 minutes)

#### Test 1: Basic Message Delivery
**Window 1 (User A):**
1. Click "Messenger" in navigation
2. Click on User B in the friends list
3. Type "Hello from User A" and press Send

**Window 2 (User B):**
1. Click "Messenger"
2. Click on User A in the friends list
3. **Expected Result**: ✅ You should see "Hello from User A" appear INSTANTLY

**Window 2 (User B):**
4. Type "Hi back from User B!" and send

**Window 1 (User A):**
5. **Expected Result**: ✅ Message appears instantly

#### What to Check in Terminal:
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
  text: 'Hello...'
}
👤 Receiver user-B socket: DEF456
✅ Sending message to socket DEF456
```

#### Test 2: Typing Indicators
**Window 1 (User A):**
1. Start typing in the message box (don't send yet)

**Window 2 (User B):**
2. **Expected Result**: ✅ See "User A is typing..." below messages

**Window 1:**
3. Stop typing for 2+ seconds
   
**Window 2:**
4. **Expected Result**: ✅ Typing indicator disappears

#### Test 3: Message Persistence
**Window 1 (User A):**
1. Send a message: "Testing persistence"
2. Refresh the page (F5)
3. Navigate back to Messenger → User B
4. **Expected Result**: ✅ All previous messages are still there

---

### Part 3: Testing Voice Calls (5 minutes)

#### Test 4: Voice Call Flow
**Window 1 (User A):**
1. Make sure you're in the chat with User B
2. Click the 📞 (phone) button
3. **Expected Result**: ✅ Browser asks for microphone permission → Click "Allow"
4. **Expected Result**: ✅ See "Voice Call with User B" modal

**Window 2 (User B):**
5. **Expected Result**: ✅ See "Incoming Voice Call" modal
6. Click "Accept"
7. **Expected Result**: ✅ Browser asks for mic permission → Click "Allow"
8. **Expected Result**: ✅ Call connects, you should hear each other!

**Both Windows:**
9. Try the 🎤 Mute button
10. **Expected Result**: ✅ Other person can't hear you when muted
11. Click "End Call"
12. **Expected Result**: ✅ Call ends, modal closes

#### What to Check in Terminal:
```
Call from user-A to user-B
(Should appear ONCE, not spam!)
```

---

### Part 4: Testing Video Calls (5 minutes)

#### Test 5: Video Call Flow
**Window 1 (User A):**
1. Click the 📹 (video) button
2. **Expected Result**: ✅ Browser asks for camera+mic → Click "Allow"
3. **Expected Result**: ✅ See your video in picture-in-picture (small box)

**Window 2 (User B):**
4. **Expected Result**: ✅ See "Incoming Video Call" modal
5. Click "Accept"
6. **Expected Result**: ✅ Browser asks for camera+mic → Click "Allow"

**Both Windows:**
7. **Expected Result**: ✅ See remote video (fullscreen) and local video (small box)
8. Try 📹 Camera button
9. **Expected Result**: ✅ Your video turns off/on
10. Try 🎤 Mute button
11. Try "End Call"
12. **Expected Result**: ✅ Call ends, cameras stop

---

### Part 5: Edge Cases & Error Handling (5 minutes)

#### Test 6: Offline User
**Window 2 (User B):**
1. Close the browser window (User B goes offline)

**Window 1 (User A):**
2. Try sending a message
3. **Expected Result**: ✅ Message saves to database but receiver is offline
4. Check terminal: Should show `❌ Receiver user-B not connected`

**Window 2 (User B):**
5. Open browser again, login, go to Messenger
6. **Expected Result**: ✅ See the message User A sent while offline

#### Test 7: Multiple Conversations
**Window 1 (User A):**
1. Create a 3rd user (User C)
2. Add User C as friend
3. Switch between User B and User C conversations
4. **Expected Result**: ✅ Messages stay separated per conversation

#### Test 8: Network Disconnect
**Window 1:**
1. Open DevTools (F12) → Network tab
2. Set to "Offline" mode
3. **Expected Result**: ✅ Status shows "Connecting..." or offline indicator
4. Set back to "Online"
5. **Expected Result**: ✅ Reconnects automatically

---

## 🐛 Troubleshooting

### Problem: Messages not appearing
**Check:**
- [ ] Is the receiver on the `/messenger` page?
- [ ] Did they select your conversation?
- [ ] Check terminal: Do you see BOTH users joined?
- [ ] Check browser console (F12): Any errors?

**Solution:**
- Both users MUST be on `/messenger` with the conversation open
- Refresh both browser windows
- Check Socket.IO logs in terminal

### Problem: Calls not connecting
**Check:**
- [ ] Did you allow microphone/camera permissions?
- [ ] Are both users on the messenger page?
- [ ] Is only ONE call attempt shown in terminal? (not spam)

**Solution:**
- Clear browser cache and reload
- Check browser console for errors
- Make sure both users are connected to Socket.IO

### Problem: "Socket not connected"
**Check:**
- [ ] Is the server running? (Check http://localhost:3000)
- [ ] Check terminal for Socket.IO initialization message
- [ ] Look for connection errors in browser console

**Solution:**
- Restart the server: `npm run dev`
- Clear browser cache
- Check for firewall blocking WebSocket

### Problem: Can't hear audio in calls
**Check:**
- [ ] Is microphone muted in browser?
- [ ] Volume turned up?
- [ ] Correct input/output devices selected?

**Solution:**
- Check browser's site permissions (click lock icon in address bar)
- Test microphone in browser settings
- Try different browser

---

## 📊 What Success Looks Like

### Terminal Output (Good):
```
✓ Socket.IO server initialized
🚀 Server ready on http://localhost:3000
✓ Socket connected: ABC123
👤 User user-A joined with socket ABC123
✓ Socket connected: DEF456  
👤 User user-B joined with socket DEF456
📊 Active users: user-A, user-B
📨 Message received on server
✅ Sending message to socket DEF456
```

### Browser Console (Good):
```
🔌 Initializing socket connection for user: XXX
✅ Socket connected: ABC123
📤 Sent join event with userId: XXX
📨 Message received via socket: {...}
```

### Visual Indicators (Good):
- Messages appear instantly (<1 second delay)
- Typing indicator appears/disappears smoothly
- Video streams show without lag
- Audio is clear with no echo
- Call connects within 2-3 seconds

---

## ⚡ Performance Benchmarks

**Expected Performance:**
- Message delivery: < 100ms
- Typing indicator: < 200ms
- Call connection: 2-3 seconds
- Video quality: 640x480 minimum
- No message loss
- No duplicate messages

---

## 🎯 Final Verification

After all tests, you should have:
- [x] Real-time messaging working bidirectionally
- [x] Typing indicators functional
- [x] Message persistence (survives refresh)
- [x] Voice calls connecting and audio working
- [x] Video calls with both streams visible
- [x] Proper handling of offline users
- [x] Clean terminal logs (no spam)
- [x] No errors in browser console
- [x] Call controls (mute, camera, end) working

**If all checked ✅ - Your app is working perfectly! 🎉**

---

## 📸 What to Screenshot for Verification

1. Both browser windows showing instant message delivery
2. Terminal showing both users connected
3. Video call with both streams visible
4. Browser console showing clean Socket.IO logs
5. Message history after page refresh

---

## 💡 Tips

- Keep browser DevTools (F12) open while testing to see console logs
- Watch the terminal for real-time Socket.IO events
- Test on different browsers (Chrome, Firefox, Edge)
- Try on mobile devices if possible
- Test with 3+ users for multi-user scenarios

---

## 🚀 Next Steps After Testing

If everything works:
1. Consider deploying to a production server
2. Add more features (group chats, file sharing, etc.)
3. Optimize video quality settings
4. Add more detailed error messages
5. Implement reconnection logic improvements

If issues remain:
1. Check `SOCKET_DEBUG_GUIDE.md` for detailed troubleshooting
2. Review browser console errors
3. Check network tab for failed requests
4. Verify database connections
5. Test with simpler scenarios first
