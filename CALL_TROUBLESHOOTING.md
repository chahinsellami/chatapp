# Voice/Video Call Troubleshooting Guide

## What I Fixed

### 1. **Better TURN Servers**
- Added Twilio's public TURN server as a backup
- Added `iceTransportPolicy: 'all'` to try all connection methods
- This should help with connections between different networks

### 2. **Comprehensive Logging**
Now you can see what's happening in the browser console (F12):
- `📞 Incoming call from...` - When receiving a call
- `✅ Call accepted by remote peer` - When call is accepted
- `❌ Call rejected by remote peer` - When call is rejected
- `✅ WebRTC peer connected successfully!` - When connection established
- `✅ Received remote stream!` - When video/audio is flowing

### 3. **Pre-Call Checks**
Before starting a call, the app now checks:
- ✅ Is the friend online?
- ✅ Is socket connected?
- ✅ Shows console logs for debugging

### 4. **Diagnostic Tool**
Click the **Settings** icon (⚙️) next to the call buttons to run diagnostics:
- Tests browser WebRTC support
- Checks for camera/microphone
- Tests permissions
- Checks socket connection
- Shows if friend is online

### 5. **Better Error Messages**
Instead of silent failures, you now get clear alerts:
- "Friend is offline" - Can't call if they're not connected
- "Not connected to server" - Socket issue
- "Call connection error: [reason]" - WebRTC issues
- Specific permission errors

## How to Test Calls

### Test 1: Same Network (Should Work ✅)
1. Open two browser windows (or use incognito mode)
2. Login as two different users
3. Make sure both see each other as "Online"
4. Click the phone icon 📞 or video icon 📹
5. Accept the call on the other window
6. **Expected**: Call should connect within 5-10 seconds

### Test 2: Different Networks (May Fail ⚠️)
1. Have two people on different WiFi networks
2. Both login and make sure they see each other online
3. Try to start a call
4. **If it fails**: This is likely due to NAT/firewall restrictions

## What to Check If Calls Don't Work

### 1. **Browser Console (F12)**
Press F12 to open developer console and look for:
- ❌ Red errors about WebRTC
- 🔍 Look for "call-user", "incoming-call", "call-accepted" events
- 🧊 Look for ICE candidate messages

### 2. **Run Diagnostics**
Click the Settings button (⚙️) in the chat header and check:
- ✅ Browser WebRTC Support - Must show green checkmark
- ✅ Media Devices - Must show your microphone/camera
- ✅ Media Permissions - Must be granted
- ✅ Socket.IO connected - Must show as connected
- ✅ Friend is online - Friend must be online

### 3. **Common Issues & Solutions**

| Problem | Cause | Solution |
|---------|-------|----------|
| Friend shows as offline | Not connected or different instance | Refresh both pages |
| Permission denied | Camera/mic blocked | Go to browser settings → Site settings → Allow camera/mic |
| Call never connects | NAT/Firewall blocking | See "TURN Server Setup" below |
| Only one-way audio/video | Asymmetric NAT | Use better TURN server |
| "Not connected to server" | Socket.IO disconnected | Refresh the page |

## TURN Server Setup (For Different Networks)

The current free TURN servers may not work reliably. For production use:

### Option 1: Twilio (Easiest - Free Tier Available)

1. Sign up at https://www.twilio.com/
2. Get your TURN credentials
3. Update `lib/useWebRTC.ts` lines 147-152 and 348-353:

```typescript
{
  urls: "turn:global.turn.twilio.com:3478?transport=tcp",
  username: "YOUR_TWILIO_USERNAME",  // Replace this
  credential: "YOUR_TWILIO_CREDENTIAL"  // Replace this
}
```

### Option 2: Xirsys (Good Free Tier)

1. Sign up at https://xirsys.com/
2. Create a channel
3. Get TURN credentials
4. Update TURN server config with Xirsys credentials

### Option 3: Metered (Most Reliable - Paid)

1. Sign up at https://www.metered.ca/
2. Get your turn servers
3. Update TURN server config

## Testing WebRTC Connection

### Online Tools:
- **Trickle ICE Test**: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
  - Paste this in "ICE servers" field:
    ```
    stun:stun.l.google.com:19302
    ```
  - Click "Gather candidates"
  - You should see "srflx" (reflexive) candidates - these are your public IPs
  - If you see "relay" candidates, TURN is working

### Browser Test:
1. Open browser console (F12)
2. Paste this code:
```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
});

pc.createDataChannel('test');
pc.createOffer().then(offer => pc.setLocalDescription(offer));

pc.onicecandidate = e => {
  if (e.candidate) {
    console.log('ICE Candidate:', e.candidate.type, e.candidate.candidate);
  } else {
    console.log('All ICE candidates gathered');
  }
};

pc.onicegatheringstatechange = () => {
  console.log('ICE Gathering State:', pc.iceGatheringState);
};
```

3. Look for:
   - `host` candidates (local network)
   - `srflx` candidates (STUN working - public IP discovered)
   - `relay` candidates (TURN working - relay available)

## Current Limitations

1. **Free TURN Servers**: May be slow or unavailable
2. **Corporate Networks**: May block WebRTC completely
3. **Symmetric NAT**: Hardest to traverse, needs TURN
4. **Mobile Data**: Some carriers block P2P connections

## What Should Work Now

✅ Calls on the same WiFi network
✅ Calls on same computer (localhost testing)
✅ Better error messages when calls fail
✅ Diagnostic tool to identify issues
✅ Console logging for debugging

## What May Still Fail

⚠️ Calls between different networks (until you set up proper TURN)
⚠️ Calls behind corporate firewalls
⚠️ Calls on certain mobile networks

## Next Steps

1. **Test locally first**: Open two browser windows, login as different users, try calling
2. **Check console logs**: Look for errors in F12 developer console
3. **Run diagnostics**: Click Settings button to test your setup
4. **If still failing**: Set up Twilio TURN server (free tier)

## Need More Help?

Share:
1. Browser console logs (F12)
2. Diagnostic test results
3. Network setup (same WiFi? different locations?)
4. Any error messages you see

The new logging will help identify exactly where the call is failing!
