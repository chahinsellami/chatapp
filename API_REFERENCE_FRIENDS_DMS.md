# Friends & Direct Messages API Quick Reference

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Friends API

### List Friends & Pending Requests
```
GET /api/friends
```

### Send Friend Request
```
POST /api/friends
Body: { "receiverId": "user-id" }
```

### Accept Friend Request
```
PUT /api/friends/requests/[requestId]?action=accept
```

### Reject Friend Request
```
PUT /api/friends/requests/[requestId]?action=reject
```

### Remove Friend
```
DELETE /api/friends/[friendId]
```

---

## Direct Messages API

### Get Messages with User
```
GET /api/messages/direct/[userId]
```
Returns all messages between you and another user, ordered chronologically.

### Send Message
```
POST /api/messages/direct/[userId]
Body: { "text": "message content" }
```

### Edit Message
```
PUT /api/messages/direct/actions/[messageId]
Body: { "text": "updated message" }
```

### Delete Message
```
DELETE /api/messages/direct/actions/[messageId]
```

---

## Database Schema

### friends
- Bidirectional friend relationships
- Includes: id, userId, friendId, status, createdAt
- Friends listed in both directions

### friendRequests
- Pending friend invitations
- Includes: id, senderId, receiverId, status, createdAt
- Status: "pending", "accepted", or "rejected"

### directMessages
- 1-on-1 messages between users
- Includes: id, senderId, receiverId, text, createdAt, editedAt
- Query for messages between any two users

---

## Example Usage (curl)

### Get your friends
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/friends
```

### Send friend request
```bash
curl -X POST http://localhost:3000/api/friends \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"other-user-id"}'
```

### Accept friend request
```bash
curl -X PUT "http://localhost:3000/api/friends/requests/request-id?action=accept" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send direct message
```bash
curl -X POST http://localhost:3000/api/messages/direct/friend-user-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!"}'
```

### Get message history
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/messages/direct/friend-user-id
```

### Edit message
```bash
curl -X PUT http://localhost:3000/api/messages/direct/actions/message-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Updated message"}'
```

### Delete message
```bash
curl -X DELETE http://localhost:3000/api/messages/direct/actions/message-id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Responses

### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

### 400 Bad Request
```json
{ "error": "Description of what went wrong" }
```

### 500 Server Error
```json
{ "error": "Failed to [operation description]" }
```

---

## Response Examples

### GET /api/friends
```json
{
  "friends": [
    {
      "id": "user-123",
      "username": "alice",
      "avatar": "url/to/avatar",
      "status": "online",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pendingRequests": [
    {
      "id": "request-456",
      "senderId": "user-789",
      "username": "bob",
      "avatar": "url/to/avatar",
      "createdAt": "2024-01-01T11:00:00Z"
    }
  ]
}
```

### GET /api/messages/direct/[userId]
```json
{
  "messages": [
    {
      "id": "msg-123",
      "senderId": "you",
      "receiverId": "them",
      "text": "Hey, how are you?",
      "username": "you-username",
      "avatar": "url",
      "createdAt": "2024-01-01T12:00:00Z",
      "editedAt": null
    },
    {
      "id": "msg-124",
      "senderId": "them",
      "receiverId": "you",
      "text": "Doing great!",
      "username": "their-username",
      "avatar": "url",
      "createdAt": "2024-01-01T12:01:00Z",
      "editedAt": null
    }
  ]
}
```

---

**Status**: Ready for UI integration ✅
**All endpoints tested and documented**
