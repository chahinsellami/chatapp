/**
 * PostgreSQL database connection and query utilities
 * Provides connection pooling, schema initialization, and CRUD operations
 * for users, messages, friends, and direct messaging functionality
 */

import { Pool } from "pg";

// PostgreSQL connection pool for efficient database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Database URL from environment variables
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false } // Required for Railway PostgreSQL
      : false, // No SSL for local development
});

// Connection event handlers for monitoring
pool.on("connect", () => {
  // Successfully connected to database
});

pool.on("error", (err) => {
  // Database connection error occurred
});

export { pool };

/**
 * Initialize database schema
 * Creates all necessary tables if they don't exist
 * Sets up the complete database structure for the chat application
 */
export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    // Create users table - stores user account information
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for user identification
        username VARCHAR(255) UNIQUE NOT NULL, -- Unique username for display
        email VARCHAR(255) UNIQUE NOT NULL,    -- Unique email for authentication
        password_hash VARCHAR(255) NOT NULL,   -- Hashed password for security
        avatar TEXT,                           -- Profile picture (TEXT for Base64 images)
        status VARCHAR(50) DEFAULT 'offline',  -- Online/offline/away status
        bio TEXT DEFAULT '',                   -- User biography/description
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Account creation time
      )
    `);

    // Migration: Change avatar column to TEXT if it's VARCHAR
    try {
      await client.query(`
        ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;
      `);
    } catch (err) {
      // Ignore error if column is already TEXT or doesn't exist
    }

    // Migration: Add cover_image column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image TEXT;
      `);
    } catch (err) {
      // Ignore error if column already exists
    }

    // Create channels table - for group chat functionality
    await client.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for channel identification
        name VARCHAR(255) NOT NULL,            -- Channel display name
        description TEXT,                      -- Channel description/purpose
        is_private BOOLEAN DEFAULT FALSE,      -- Whether channel is private
        created_by VARCHAR(36) NOT NULL REFERENCES users(id), -- Channel creator
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Channel creation time
      )
    `);

    // Create channel members table - tracks which users are in which channels
    await client.query(`
      CREATE TABLE IF NOT EXISTS channel_members (
        channel_id VARCHAR(36) NOT NULL REFERENCES channels(id), -- Channel reference
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),       -- User reference
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- When user joined
        PRIMARY KEY(channel_id, user_id)        -- Composite primary key
      )
    `);

    // Create messages table - stores channel messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for message identification
        text TEXT NOT NULL,                    -- Message content
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),      -- Message sender
        channel_id VARCHAR(36) NOT NULL REFERENCES channels(id), -- Target channel
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Message timestamp
        edited_at TIMESTAMP                    -- Last edit timestamp (null if never edited)
      )
    `);

    // Create conversations table - tracks direct message conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for conversation identification
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),      -- First participant
        participant_id VARCHAR(36) NOT NULL REFERENCES users(id), -- Second participant
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Conversation start time
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Last activity time
        UNIQUE(user_id, participant_id)        -- Prevent duplicate conversations
      )
    `);

    // Create friends table - stores accepted friend relationships
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for friendship record
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),      -- First friend
        friend_id VARCHAR(36) NOT NULL REFERENCES users(id),    -- Second friend
        status VARCHAR(50) DEFAULT 'accepted', -- Friendship status
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- When friendship started
        UNIQUE(user_id, friend_id)            -- Prevent duplicate friendships
      )
    `);

    // Create friend requests table - stores pending friend requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for request identification
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id),    -- Request sender
        receiver_id VARCHAR(36) NOT NULL REFERENCES users(id),  -- Request receiver
        status VARCHAR(50) DEFAULT 'pending', -- pending/accepted/rejected
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Request timestamp
        UNIQUE(sender_id, receiver_id)        -- Prevent duplicate requests
      )
    `);

    // Create direct messages table - stores private messages between users
    await client.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for message identification
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id),    -- Message sender
        receiver_id VARCHAR(36) NOT NULL,     -- Message receiver (no FK for flexibility)
        text TEXT NOT NULL,                    -- Message content
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Message timestamp
        edited_at TIMESTAMP                    -- Last edit timestamp
      )
    `);

    // Create posts table - stores user posts for social feed
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for post identification
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),      -- Post author
        content TEXT NOT NULL,                 -- Post text content
        image TEXT,                            -- Optional post image (Base64)
        likes INTEGER DEFAULT 0,               -- Number of likes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Post timestamp
        edited_at TIMESTAMP                    -- Last edit timestamp
      )
    `);

    // Create post_likes table - tracks who liked which posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for like record
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)              -- Prevent duplicate likes
      )
    `);

    // Create post_comments table - stores comments on posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id VARCHAR(36) PRIMARY KEY,           -- UUID for comment identification
        post_id VARCHAR(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,                 -- Comment text
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add cover_photo column to users table if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo TEXT;
      `);
    } catch (err) {
      // Ignore if column already exists
    }
  } catch (error) {
    // Rethrow any database initialization errors
    throw error;
  } finally {
    // Always release the database connection
    client.release();
  }
}

// ============================================================================
// USER FUNCTIONS - Authentication and user management operations
// ============================================================================

/**
 * Find a user by their email address
 * Used during login authentication
 * @param email - User's email address
 * @returns User object or undefined if not found
 */
export async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

/**
 * Find a user by their username
 * Used for username-based lookups and validation
 * @param username - User's username
 * @returns User object or undefined if not found
 */
export async function getUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
}

/**
 * Find a user by their ID
 * Returns public profile information (excludes password hash)
 * @param id - User's unique identifier
 * @returns User profile object or undefined if not found
 */
export async function getUserById(id: string) {
  const result = await pool.query(
    "SELECT id, username, email, avatar, status, bio, cover_image, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

/**
 * Create a new user account
 * Used during user registration
 * @param id - Generated UUID for the user
 * @param username - Desired username
 * @param email - User's email address
 * @param passwordHash - Hashed password for security
 * @returns Created user object
 */
export async function createUser(
  id: string,
  username: string,
  email: string,
  passwordHash: string
) {
  const result = await pool.query(
    `INSERT INTO users (id, username, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, avatar, status, bio, created_at`,
    [id, username, email, passwordHash]
  );
  return result.rows[0];
}

/**
 * Update a user's complete profile information
 * Used when user completes their profile setup
 * @param userId - User's ID
 * @param avatar - Profile picture URL
 * @param status - Online status
 * @param bio - User biography
 * @returns Updated user object
 */
export async function updateUserProfileComplete(
  userId: string,
  username: string,
  avatar: string,
  status: string,
  bio: string,
  coverImage: string = ""
) {
  const result = await pool.query(
    `UPDATE users
     SET username = $1, avatar = $2, status = $3, bio = $4, cover_image = $5
     WHERE id = $6
     RETURNING id, username, email, avatar, status, bio, cover_image, created_at`,
    [username, avatar, status, bio, coverImage, userId]
  );
  return result.rows[0];
}

/**
 * Update a user's online status
 * Used for presence indication in the UI
 * @param userId - User's ID
 * @param status - New status (online/offline/away)
 */
export async function updateUserStatus(userId: string, status: string) {
  await pool.query("UPDATE users SET status = $1 WHERE id = $2", [
    status,
    userId,
  ]);
}

// ============================================================================
// MESSAGE FUNCTIONS - Channel messaging operations
// ============================================================================

/**
 * Get all messages for a specific channel
 * Includes user information for each message
 * @param channelId - ID of the channel to get messages for
 * @returns Array of messages with user details, ordered by creation time
 */
export async function getMessagesByChannelId(channelId: string) {
  const result = await pool.query(
    `SELECT m.id, m.text, m.user_id, m.channel_id, m.created_at, m.edited_at,
            u.username, u.avatar
     FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.channel_id = $1
     ORDER BY m.created_at ASC`,
    [channelId]
  );
  return result.rows;
}

/**
 * Insert a new message into a channel
 * @param id - Generated UUID for the message
 * @param text - Message content
 * @param userId - ID of the user sending the message
 * @param channelId - ID of the target channel
 * @returns Created message object
 */
export async function insertMessage(
  id: string,
  text: string,
  userId: string,
  channelId: string
) {
  const result = await pool.query(
    `INSERT INTO messages (id, text, user_id, channel_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, text, userId, channelId]
  );
  return result.rows[0];
}

// ============================================================================
// FRIEND FUNCTIONS - Friendship and friend request management
// ============================================================================

/**
 * Get all accepted friends for a user
 * Returns friend list with profile information
 * @param userId - ID of the user to get friends for
 * @returns Array of friend objects with user details
 */
export async function getFriendsByUserId(userId: string) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.avatar, u.status,
            f.created_at
     FROM friends f
     INNER JOIN users u ON f.friend_id = u.id
     WHERE f.user_id = $1 AND f.status = 'accepted' AND u.id IS NOT NULL
     ORDER BY u.username ASC`,
    [userId]
  );
  return result.rows;
}

/**
 * Get all pending friend requests for a user
 * @param userId - ID of the user to get friend requests for
 * @returns Array of pending friend request objects
 */
export async function getPendingFriendRequests(userId: string) {
  const result = await pool.query(
    `SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at,
            u.username, u.avatar
     FROM friend_requests fr
     JOIN users u ON fr.sender_id = u.id
     WHERE fr.receiver_id = $1 AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Create a new friend request
 * @param id - Generated UUID for the request
 * @param senderId - ID of the user sending the request
 * @param receiverId - ID of the user receiving the request
 * @returns Created friend request object
 */
export async function insertFriendRequest(
  id: string,
  senderId: string,
  receiverId: string
) {
  const result = await pool.query(
    `INSERT INTO friend_requests (id, sender_id, receiver_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, senderId, receiverId]
  );
  return result.rows[0];
}

/**
 * Get a specific friend request by ID
 * @param requestId - ID of the friend request
 * @returns Friend request object or undefined
 */
export async function getFriendRequest(requestId: string) {
  const result = await pool.query(
    `SELECT * FROM friend_requests WHERE id = $1`,
    [requestId]
  );
  return result.rows[0];
}

/**
 * Accept a friend request and create friendship relationships
 * Uses database transaction to ensure data consistency
 * @param requestId - ID of the friend request to accept
 * @param userId - ID of the user accepting the request
 * @param friendId - ID of the user who sent the request
 * @returns Success status and message
 */
export async function acceptFriendRequest(
  requestId: string,
  userId: string,
  friendId: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update friend request status to accepted
    await client.query("UPDATE friend_requests SET status = $1 WHERE id = $2", [
      "accepted",
      requestId,
    ]);

    // Create bidirectional friend relationships
    const friendId1 = crypto.randomUUID?.() || Math.random().toString();
    const friendId2 = crypto.randomUUID?.() || Math.random().toString();

    await client.query(
      `INSERT INTO friends (id, user_id, friend_id, status)
       VALUES ($1, $2, $3, 'accepted')`,
      [friendId1, userId, friendId]
    );

    await client.query(
      `INSERT INTO friends (id, user_id, friend_id, status)
       VALUES ($1, $2, $3, 'accepted')`,
      [friendId2, friendId, userId]
    );

    await client.query("COMMIT");
    return { success: true, message: "Friend request accepted" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reject a friend request
 * @param requestId - ID of the friend request to reject
 * @returns Success status and message
 */
export async function rejectFriendRequest(requestId: string) {
  await pool.query("UPDATE friend_requests SET status = $1 WHERE id = $2", [
    "rejected",
    requestId,
  ]);
  return { success: true, message: "Friend request rejected" };
}

// ============================================================================
// DIRECT MESSAGE FUNCTIONS - Private messaging between users
// ============================================================================

/**
 * Get all direct messages between two users
 * Returns messages in both directions (sent and received)
 * @param userId1 - ID of first user
 * @param userId2 - ID of second user
 * @returns Array of direct messages with sender information
 */
export async function getDirectMessages(userId1: string, userId2: string) {
  const result = await pool.query(
    `SELECT d.id, d.sender_id, d.receiver_id, d.text, d.created_at, d.edited_at,
            u.username, u.avatar
     FROM direct_messages d
     LEFT JOIN users u ON d.sender_id = u.id
     WHERE (d.sender_id = $1 AND d.receiver_id = $2) OR (d.sender_id = $2 AND d.receiver_id = $1)
     ORDER BY d.created_at ASC`,
    [userId1, userId2]
  );
  return result.rows;
}

/**
 * Insert a new direct message
 * @param id - Generated UUID for the message
 * @param senderId - ID of the user sending the message
 * @param receiverId - ID of the user receiving the message
 * @param text - Message content
 * @returns Created direct message object
 */
export async function insertDirectMessage(
  id: string,
  senderId: string,
  receiverId: string,
  text: string
) {
  const result = await pool.query(
    `INSERT INTO direct_messages (id, sender_id, receiver_id, text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, senderId, receiverId, text]
  );
  return result.rows[0];
}

/**
 * Update the content of a direct message
 * Sets the edited_at timestamp to current time
 * @param messageId - ID of the message to update
 * @param text - New message content
 * @returns Update confirmation
 */
export async function updateDirectMessage(messageId: string, text: string) {
  const now = new Date().toISOString();
  await pool.query(
    `UPDATE direct_messages SET text = $1, edited_at = $2 WHERE id = $3`,
    [text, now, messageId]
  );
  return { updated: true };
}

/**
 * Delete a direct message
 * @param messageId - ID of the message to delete
 * @returns Deletion confirmation
 */
export async function deleteDirectMessage(messageId: string) {
  await pool.query(`DELETE FROM direct_messages WHERE id = $1`, [messageId]);
  return { deleted: true };
}

// ============================================================================
// USER SEARCH FUNCTIONS - Finding users for messaging/friending
// ============================================================================

/**
 * Search for users by username or email
 * Used for user discovery and friend adding
 * @param query - Search term (partial username or email)
 * @param excludeUserId - User ID to exclude from results (usually current user)
 * @returns Array of matching user profiles (limited to 10 results)
 */
export async function searchUsers(query: string, excludeUserId: string) {
  const result = await pool.query(
    `SELECT id, username, avatar, status
     FROM users
     WHERE (username ILIKE $1 OR email ILIKE $1)
     AND id != $2
     LIMIT 10`,
    [`%${query}%`, excludeUserId]
  );
  return result.rows;
}
