# WebRTC Voice/Video Calls Setup Guide

## How WebRTC Works

WebRTC (Web Real-Time Communication) enables peer-to-peer audio and video calls directly between browsers without routing through a server. However, establishing these connections can be challenging due to NAT (Network Address Translation) and firewalls.

## Why Calls Work Locally But Not Between Networks

### Working on Same PC/Network ✅

- Both users share the same public IP address
- No NAT traversal needed
- Direct local connection possible

### Not Working Between Different Networks ❌

- Each user is behind their own router/firewall
- NAT prevents direct connections
- Firewalls may block WebRTC traffic
- Need TURN servers to relay traffic

## Current Setup

### STUN Servers

We use Google's public STUN servers to discover public IP addresses:

```javascript
{
  urls: "stun:stun.l.google.com:19302";
}
{
  urls: "stun:stun1-4.l.google.com:19302";
}
```

**What STUN does:**

- Discovers your public IP address
- Works when both users can connect directly
- **Limitation:** Fails when strict NAT/firewalls block direct connections (≈20% of cases)

### TURN Servers (Relay)

We use free public TURN servers from OpenRelay:

```javascript
{
  urls: "turn:openrelay.metered.ca:80",
  username: "openrelayproject",
  credential: "openrelayproject"
}
```

**What TURN does:**

- Relays audio/video traffic when direct connection fails
- Works behind strict NAT/firewalls
- **Limitation:** Free public servers are unreliable and may be slow

## Troubleshooting Call Issues

### 1. Check Browser Compatibility

**Supported Browsers:**

- ✅ Chrome/Edge (Chromium) - Best support
- ✅ Firefox - Good support
- ✅ Safari - Good support
- ❌ Internet Explorer - Not supported

### 2. Check Network Requirements

- **Ports:** WebRTC uses UDP ports 49152-65535
- **Firewall:** May need to allow WebRTC traffic
- **VPN:** Can interfere with connections

### 3. Test Connection

Open browser console (F12) and check for errors:

- `PermissionDeniedError` - Camera/mic access denied
- `NotFoundError` - No camera/mic found
- `ICE failed` - Connection couldn't be established

### 4. Common Issues & Solutions

| Issue                       | Cause                 | Solution                   |
| --------------------------- | --------------------- | -------------------------- |
| "Connecting..." forever     | NAT/Firewall blocking | Use better TURN server     |
| No audio/video              | Permission denied     | Grant browser permissions  |
| One-way audio/video         | Asymmetric NAT        | Use TURN relay             |
| Connection drops            | Unstable network      | Check internet connection  |
| Works locally, not remotely | No TURN server        | Configure TURN (see below) |

## Improving Call Reliability

### Option 1: Use Professional TURN Services (Recommended)

**Twilio (Free tier available):**

```javascript
{
  urls: "turn:global.turn.twilio.com:3478?transport=tcp",
  username: "YOUR_TWILIO_USERNAME",
  credential: "YOUR_TWILIO_CREDENTIAL"
}
```

**Xirsys (Free tier available):**

```javascript
{
  urls: "turn:YOUR_CHANNEL.xirsys.com:443?transport=tcp",
  username: "YOUR_XIRSYS_USERNAME",
  credential: "YOUR_XIRSYS_CREDENTIAL"
}
```

**Metered (Paid, very reliable):**

```javascript
{
  urls: "turn:a.relay.metered.ca:443",
  username: "YOUR_USERNAME",
  credential: "YOUR_CREDENTIAL"
}
```

### Option 2: Self-Host TURN Server (Advanced)

**Using Coturn (Open Source):**

1. Install on a VPS/cloud server:

   ```bash
   sudo apt install coturn
   ```

2. Configure `/etc/turnserver.conf`:

   ```
   listening-port=3478
   fingerprint
   lt-cred-mech
   user=username:password
   realm=yourdomain.com
   ```

3. Update WebRTC config:
   ```javascript
   {
     urls: "turn:your-server.com:3478",
     username: "username",
     credential: "password"
   }
   ```

### Option 3: Use Environment Variables

Update `lib/useWebRTC.ts` to use environment variables:

```typescript
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  ...(process.env.NEXT_PUBLIC_TURN_URL
    ? [
        {
          urls: process.env.NEXT_PUBLIC_TURN_URL,
          username: process.env.NEXT_PUBLIC_TURN_USERNAME,
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
        },
      ]
    : []),
];
```

Add to `.env.local`:

```env
NEXT_PUBLIC_TURN_URL=turn:your-turn-server:3478
NEXT_PUBLIC_TURN_USERNAME=your-username
NEXT_PUBLIC_TURN_CREDENTIAL=your-password
```

## Testing WebRTC

### Online Testing Tools

- **WebRTC Test:** https://test.webrtc.org/
- **Trickle ICE Test:** https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
- **Network Traversal Test:** https://networktest.twilio.com/

### Browser Console Commands

```javascript
// Check available devices
navigator.mediaDevices.enumerateDevices();

// Test getUserMedia
navigator.mediaDevices
  .getUserMedia({ audio: true, video: true })
  .then((stream) => console.log("Success:", stream))
  .catch((err) => console.error("Error:", err));
```

## Production Recommendations

### For Best Call Quality:

1. ✅ Use professional TURN service (Twilio, Xirsys, Metered)
2. ✅ Implement connection quality monitoring
3. ✅ Add network speed detection
4. ✅ Show connection status to users
5. ✅ Implement automatic reconnection
6. ✅ Add call recording feature (optional)
7. ✅ Monitor TURN server usage/costs

### Cost Estimates:

- **Twilio:** Free tier: 500 MB/month, then $0.0004/MB
- **Xirsys:** Free tier: 500 MB/month, then $0.50/GB
- **Metered:** $0.50/GB (no free tier but very reliable)
- **Self-hosted Coturn:** $5-10/month VPS + bandwidth costs

## Current Limitations

1. **Free TURN Servers:** Unreliable, may be slow or unavailable
2. **No Connection Quality Indicator:** Users don't know if connection is good
3. **No Automatic Fallback:** Doesn't retry with different servers
4. **No Recording:** Can't save calls
5. **No Screen Sharing:** Only audio/video calls supported

## Next Steps

To improve call reliability between different networks:

1. **Immediate:** Sign up for Twilio/Xirsys free tier and add their TURN servers
2. **Short-term:** Add connection quality indicators and automatic reconnection
3. **Long-term:** Consider self-hosting TURN server for full control

## Support

If calls still don't work after following this guide:

1. Check browser console for errors
2. Test with online WebRTC testing tools
3. Verify both users granted camera/microphone permissions
4. Try different browsers
5. Check if corporate firewall is blocking WebRTC

---

**Remember:** WebRTC works perfectly on the same network because no NAT traversal is needed. For production use with users on different networks, proper TURN servers are essential!
