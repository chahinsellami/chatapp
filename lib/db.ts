// Database utility functions for SQLite
import Database from "better-sqlite3";
import path from "path";

// Create database instance
// The database file is stored in a .data directory in the project root
const DB_PATH = path.join(process.cwd(), ".data", "webchat.db");

// Initialize database connection (lazy loaded)
let db: Database.Database | null = null;

/**
 * Get or create the database connection
 * This function initializes the database only once and reuses the connection
 */
function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable foreign keys for referential integrity
    db.pragma("foreign_keys = ON");
  }
  return db;
}

/**
 * Initialize database schema
 * Creates all necessary tables if they don't exist
 * This function is called once when the app starts
 */
export function initializeDatabase() {
  const database = getDatabase();

  // Create users table (NEW - Feature 6)
  // Stores user account information, passwords, and profiles
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      avatar TEXT,
      status TEXT DEFAULT 'offline',
      bio TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    )
  `);

  // Migration: Add bio column if it doesn't exist
  try {
    database.exec(`
      ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
    `);
  } catch (error: any) {
    // Column already exists, ignore error
    if (!error.message.includes("duplicate column")) {
      
    }
  }

  // Create channels table (NEW - Feature 7)
  // Stores chat channels/rooms information
  database.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      isPrivate INTEGER DEFAULT 0,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(createdBy) REFERENCES users(id)
    )
  `);

  // Create channel members table (NEW)
  // Maps users to private channels
  database.exec(`
    CREATE TABLE IF NOT EXISTS channelMembers (
      channelId TEXT NOT NULL,
      userId TEXT NOT NULL,
      joinedAt TEXT NOT NULL,
      PRIMARY KEY(channelId, userId),
      FOREIGN KEY(channelId) REFERENCES channels(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // Create messages table (UPDATED)
  // Now includes userId and channelId references
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      userId TEXT NOT NULL,
      channelId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      editedAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(channelId) REFERENCES channels(id)
    )
  `);

  // Create conversations table (kept for compatibility)
  // Stores metadata about conversations between two users
  database.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      participantId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(userId, participantId)
    )
  `);

  // Create friends table (NEW - Feature 8)
  // Stores friend relationships between users
  database.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      friendId TEXT NOT NULL,
      status TEXT DEFAULT 'accepted',
      createdAt TEXT NOT NULL,
      UNIQUE(userId, friendId),
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(friendId) REFERENCES users(id)
    )
  `);

  // Create friend requests table (NEW - Feature 8)
  // Stores pending friend requests
  database.exec(`
    CREATE TABLE IF NOT EXISTS friendRequests (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      UNIQUE(senderId, receiverId),
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    )
  `);

  // Create direct messages table (NEW - Feature 8)
  // Stores 1-on-1 messages between users
  database.exec(`
    CREATE TABLE IF NOT EXISTS directMessages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      editedAt TEXT,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    )
  `);

  // Create default channels if they don't exist
  createDefaultChannels();

  
}

/**
 * Create default channels (#general, #random, #announcements)
 */
function createDefaultChannels() {
  const database = getDatabase();
  const now = new Date().toISOString();
  const systemId = "system-user";

  try {
    // Create system user if doesn't exist
    database
      .prepare(
        `
      INSERT OR IGNORE INTO users (id, username, email, passwordHash, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(systemId, "System", "system@webchat.local", "N/A", now);

    // Create default channels
    const defaultChannels = [
      { id: "general", name: "general", description: "General discussion" },
      { id: "random", name: "random", description: "Off-topic chat" },
      {
        id: "announcements",
        name: "announcements",
        description: "Important announcements",
      },
    ];

    const stmt = database.prepare(`
      INSERT OR IGNORE INTO channels (id, name, description, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const channel of defaultChannels) {
      stmt.run(channel.id, channel.name, channel.description, systemId, now);
    }
  } catch (error) {
    
  }
}

/**
 * Get all messages
 * Retrieves all messages from the database, ordered by creation date
 */
export function getAllMessages() {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM messages 
    ORDER BY createdAt ASC
  `);
  return stmt.all();
}

/**
 * Get messages for a specific conversation
 * Retrieves all messages between two users, ordered by creation date
 */
export function getConversationMessages(userId1: string, userId2: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM messages 
    WHERE 
      (senderId = ? AND receiverId = ?) OR 
      (senderId = ? AND receiverId = ?)
    ORDER BY createdAt ASC
  `);
  return stmt.all(userId1, userId2, userId2, userId1);
}

/**
 * Insert a new message
 * Adds a new message to the database and returns the inserted message
 */
export function insertMessage(
  id: string,
  text: string,
  senderId: string,
  receiverId: string,
  createdAt: string
) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO messages (id, text, senderId, receiverId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  stmt.run(id, text, senderId, receiverId, createdAt, now);

  // Return the inserted message
  return {
    id,
    text,
    senderId,
    receiverId,
    createdAt,
  };
}

/**
 * Delete a message by ID
 * Removes a message from the database
 */
export function deleteMessage(id: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare("DELETE FROM messages WHERE id = ?");
  const result = stmt.run(id);
  return (result.changes as number) > 0;
}

/**
 * Get all conversations for a user
 * Retrieves all conversations where the user is a participant
 */
export function getUserConversations(userId: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT DISTINCT 
      CASE 
        WHEN senderId = ? THEN receiverId 
        ELSE senderId 
      END as participantId
    FROM messages 
    WHERE senderId = ? OR receiverId = ?
  `);
  const result = stmt.all(userId, userId, userId) as Array<{
    participantId: string;
  }>;
  return result.map((row) => row.participantId);
}

/**
 * Clear all messages (for testing/reset)
 * Deletes all messages from the database
 */
export function clearAllMessages() {
  const database = getDatabase();
  const stmt = database.prepare("DELETE FROM messages");
  stmt.run();
}

/**
 * Close database connection
 * Should be called when the app shuts down
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Create a new user
 */
export function createUser(
  id: string,
  username: string,
  email: string,
  passwordHash: string,
  avatar?: string
) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO users (id, username, email, passwordHash, avatar, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 'offline', ?)
  `);
  const now = new Date().toISOString();
  stmt.run(id, username, email, passwordHash, avatar || null, now);
  return { id, username, email, avatar: avatar || null };
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM users WHERE email = ?
  `);
  return stmt.get(email) as any;
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM users WHERE username = ?
  `);
  return stmt.get(username) as any;
}

/**
 * Get user by ID
 */
export function getUserById(id: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT id, username, email, avatar, status, createdAt FROM users WHERE id = ?
  `);
  return stmt.get(id) as any;
}

/**
 * Get all users
 */
export function getAllUsers() {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT id, username, email, avatar, status, createdAt FROM users ORDER BY username
  `);
  return stmt.all() as any[];
}

/**
 * Update user status (online/offline/idle)
 */
export function updateUserStatus(userId: string, status: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE users SET status = ? WHERE id = ?
  `);
  stmt.run(status, userId);
}

/**
 * Update user profile with avatar, status, and bio
 */
export function updateUserProfileComplete(
  userId: string,
  avatar: string,
  status: string,
  bio: string
) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE users SET avatar = ?, status = ?, bio = ? WHERE id = ?
  `);
  stmt.run(avatar, status, bio, userId);

  // Return updated user
  const getStmt = database.prepare(`
    SELECT id, username, email, avatar, status, bio, createdAt FROM users WHERE id = ?
  `);
  return getStmt.get(userId) as any;
}

/**
 * Update user profile
 */
export function updateUserProfile(
  userId: string,
  updates: { username?: string; avatar?: string }
) {
  const database = getDatabase();
  const fields = [];
  const values = [];

  if (updates.username) {
    fields.push("username = ?");
    values.push(updates.username);
  }
  if (updates.avatar) {
    fields.push("avatar = ?");
    values.push(updates.avatar);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const stmt = database.prepare(`
    UPDATE users SET ${fields.join(", ")} WHERE id = ?
  `);
  stmt.run(...values);
}

// ============================================================================
// CHANNEL FUNCTIONS
// ============================================================================

/**
 * Create a new channel
 */
export function createChannel(
  id: string,
  name: string,
  description: string,
  createdBy: string,
  isPrivate: boolean = false
) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO channels (id, name, description, createdBy, isPrivate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  stmt.run(id, name, description, createdBy, isPrivate ? 1 : 0, now);
  return { id, name, description, createdBy, isPrivate, createdAt: now };
}

/**
 * Get all public channels
 */
export function getAllChannels() {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT id, name, description, createdBy, isPrivate, createdAt FROM channels 
    WHERE isPrivate = 0
    ORDER BY name
  `);
  return stmt.all() as any[];
}

/**
 * Get channel by ID
 */
export function getChannelById(channelId: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM channels WHERE id = ?
  `);
  return stmt.get(channelId) as any;
}

/**
 * Get channels for a user (including private channels they're members of)
 */
export function getUserChannels(userId: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT DISTINCT c.id, c.name, c.description, c.createdBy, c.isPrivate, c.createdAt
    FROM channels c
    LEFT JOIN channelMembers cm ON c.id = cm.channelId
    WHERE c.isPrivate = 0 OR cm.userId = ?
    ORDER BY c.name
  `);
  return stmt.all(userId) as any[];
}

/**
 * Add user to channel
 */
export function addUserToChannel(channelId: string, userId: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT OR IGNORE INTO channelMembers (channelId, userId, joinedAt)
    VALUES (?, ?, ?)
  `);
  const now = new Date().toISOString();
  stmt.run(channelId, userId, now);
}

/**
 * Get channel members
 */
export function getChannelMembers(channelId: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT u.id, u.username, u.avatar, u.status
    FROM users u
    JOIN channelMembers cm ON u.id = cm.userId
    WHERE cm.channelId = ?
    ORDER BY u.username
  `);
  return stmt.all(channelId) as any[];
}

// ============================================================================
// MESSAGE FUNCTIONS (UPDATED)
// ============================================================================

/**
 * Get messages for a channel
 */
export function getChannelMessages(channelId: string, limit: number = 50) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT m.id, m.text, m.userId, m.channelId, m.createdAt, m.editedAt,
           u.username, u.avatar
    FROM messages m
    JOIN users u ON m.userId = u.id
    WHERE m.channelId = ?
    ORDER BY m.createdAt DESC
    LIMIT ?
  `);
  const messages = stmt.all(channelId, limit) as any[];
  return messages.reverse(); // Return in ascending order
}

/**
 * Insert a new message to a channel
 */
export function insertChannelMessage(
  id: string,
  text: string,
  userId: string,
  channelId: string,
  createdAt: string
) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO messages (id, text, userId, channelId, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, text, userId, channelId, createdAt);

  // Return message with user info
  const user = getUserById(userId);
  return {
    id,
    text,
    userId,
    username: user?.username,
    avatar: user?.avatar,
    channelId,
    createdAt,
  };
}

/**
 * Update a message
 */
export function updateMessage(id: string, text: string) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE messages SET text = ?, editedAt = ? WHERE id = ?
  `);
  const now = new Date().toISOString();
  stmt.run(text, now, id);
}

/**
 * Delete a message
 */
export function deleteChannelMessage(id: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare("DELETE FROM messages WHERE id = ?");
  const result = stmt.run(id);
  return (result.changes as number) > 0;
}

// ============================================================================
// FRIENDS & FRIEND REQUESTS FUNCTIONS (Feature 8)
// ============================================================================

/**
 * Send a friend request
 * OPTIMIZATION: Check for existing relationship first, provide clear error
 */
export function sendFriendRequest(senderId: string, receiverId: string) {
  const database = getDatabase();

  // Check if already friends
  const existingFriendship = database
    .prepare(
      "SELECT * FROM friends WHERE userId = ? AND friendId = ? AND status = 'accepted'"
    )
    .get(senderId, receiverId);

  if (existingFriendship) {
    throw new Error("Already friends with this user");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const statement = database.prepare(
    `INSERT INTO friendRequests (id, senderId, receiverId, status, createdAt) 
     VALUES (?, ?, ?, 'pending', ?)`
  );

  try {
    statement.run(id, senderId, receiverId, now);
    return { id, senderId, receiverId, status: "pending", createdAt: now };
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Friend request already exists");
    }
    throw error;
  }
}

/**
 * Accept a friend request
 * OPTIMIZATION: Use transaction to ensure atomic operation (all or nothing)
 */
export function acceptFriendRequest(requestId: string) {
  const database = getDatabase();
  const request = database
    .prepare("SELECT * FROM friendRequests WHERE id = ?")
    .get(requestId) as any;

  if (!request) throw new Error("Friend request not found");
  if (request.status !== "pending")
    throw new Error("Friend request already processed");

  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();
  const now = new Date().toISOString();

  // Use transaction to ensure atomic operation
  const transaction = database.transaction(() => {
    // Add friend relationship both directions
    const insertFriend = database.prepare(
      `INSERT INTO friends (id, userId, friendId, status, createdAt) 
       VALUES (?, ?, ?, 'accepted', ?)`
    );

    insertFriend.run(id1, request.senderId, request.receiverId, now);
    insertFriend.run(id2, request.receiverId, request.senderId, now);

    // Update request status
    database
      .prepare("UPDATE friendRequests SET status = ? WHERE id = ?")
      .run("accepted", requestId);
  });

  transaction();

  return { status: "accepted" };
}

/**
 * Reject a friend request
 */
export function rejectFriendRequest(requestId: string) {
  const database = getDatabase();
  const request = database
    .prepare("SELECT * FROM friendRequests WHERE id = ?")
    .get(requestId) as any;

  if (!request) throw new Error("Friend request not found");
  if (request.status !== "pending")
    throw new Error("Friend request already processed");

  database
    .prepare("UPDATE friendRequests SET status = ? WHERE id = ?")
    .run("rejected", requestId);

  return { status: "rejected" };
}

/**
 * Get all friends of a user
 */
export function getUserFriends(userId: string) {
  const database = getDatabase();
  const statement = database.prepare(`
    SELECT u.id, u.username, u.avatar, u.status, u.createdAt 
    FROM friends f
    JOIN users u ON f.friendId = u.id
    WHERE f.userId = ? AND f.status = 'accepted'
    ORDER BY u.username
  `);
  return statement.all(userId) as any[];
}

/**
 * Remove a friend relationship
 * OPTIMIZATION: Use transaction for atomic deletion, verify friendship exists first
 */
export function removeFriend(userId: string, friendId: string) {
  const database = getDatabase();

  // Verify friendship exists
  const friendship = database
    .prepare(
      "SELECT * FROM friends WHERE userId = ? AND friendId = ? AND status = 'accepted'"
    )
    .get(userId, friendId);

  if (!friendship) {
    throw new Error("Not friends with this user");
  }

  // Use transaction to remove both directions atomically
  const transaction = database.transaction(() => {
    database
      .prepare(`DELETE FROM friends WHERE userId = ? AND friendId = ?`)
      .run(userId, friendId);

    database
      .prepare(`DELETE FROM friends WHERE userId = ? AND friendId = ?`)
      .run(friendId, userId);
  });

  transaction();

  return { deleted: true };
}

/**
 * Get pending friend requests for a user
 */
export function getPendingFriendRequests(userId: string) {
  const database = getDatabase();
  const statement = database.prepare(`
    SELECT f.id, f.senderId, u.username, u.avatar, f.createdAt 
    FROM friendRequests f
    JOIN users u ON f.senderId = u.id
    WHERE f.receiverId = ? AND f.status = 'pending'
    ORDER BY f.createdAt DESC
  `);
  return statement.all(userId) as any[];
}

/**
 * Check if two users are friends
 */
export function checkFriendship(userId: string, friendId: string) {
  const database = getDatabase();
  const statement = database.prepare(
    `SELECT * FROM friends WHERE userId = ? AND friendId = ? AND status = 'accepted'`
  );
  return statement.get(userId, friendId) as any | undefined;
}

// ============================================================================
// DIRECT MESSAGES FUNCTIONS (Feature 8)
// ============================================================================

/**
 * Insert a new direct message
 */
export function insertDirectMessage(
  senderId: string,
  receiverId: string,
  text: string
) {
  const database = getDatabase();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const statement = database.prepare(
    `INSERT INTO directMessages (id, senderId, receiverId, text, createdAt) 
     VALUES (?, ?, ?, ?, ?)`
  );
  statement.run(id, senderId, receiverId, text, now);
  return { id, senderId, receiverId, text, createdAt: now, editedAt: null };
}

/**
 * Get direct messages between two users
 */
export function getDirectMessages(userId1: string, userId2: string) {
  const database = getDatabase();
  const statement = database.prepare(`
    SELECT d.id, d.senderId, d.receiverId, d.text, d.createdAt, d.editedAt,
           u.username, u.avatar
    FROM directMessages d
    JOIN users u ON d.senderId = u.id
    WHERE (d.senderId = ? AND d.receiverId = ?) OR (d.senderId = ? AND d.receiverId = ?)
    ORDER BY d.createdAt ASC
  `);
  return statement.all(userId1, userId2, userId2, userId1) as any[];
}

/**
 * Update a direct message
 */
export function updateDirectMessage(messageId: string, text: string) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const statement = database.prepare(
    `UPDATE directMessages SET text = ?, editedAt = ? WHERE id = ?`
  );
  statement.run(text, now, messageId);
  return { updated: true };
}

/**
 * Delete a direct message
 */
export function deleteDirectMessage(messageId: string) {
  const database = getDatabase();
  const statement = database.prepare("DELETE FROM directMessages WHERE id = ?");
  statement.run(messageId);
  return { deleted: true };
}
