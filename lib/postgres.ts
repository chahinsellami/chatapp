import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test connection
pool.on("connect", () => {
  
});

pool.on("error", (err) => {
  
});

export { pool };

/**
 * Initialize database schema
 * Creates all necessary tables if they don't exist
 */
export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        status VARCHAR(50) DEFAULT 'offline',
        bio TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create channels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(36) NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create channel members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS channel_members (
        channel_id VARCHAR(36) NOT NULL REFERENCES channels(id),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(channel_id, user_id)
      )
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        text TEXT NOT NULL,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        channel_id VARCHAR(36) NOT NULL REFERENCES channels(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited_at TIMESTAMP
      )
    `);

    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        participant_id VARCHAR(36) NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, participant_id)
      )
    `);

    // Create friends table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        friend_id VARCHAR(36) NOT NULL REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'accepted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    // Create friend requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id),
        receiver_id VARCHAR(36) NOT NULL REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
      )
    `);

    // Create direct messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id),
        receiver_id VARCHAR(36) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited_at TIMESTAMP
      )
    `);

    
  } catch (error) {
    
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

export async function getUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
}

export async function getUserById(id: string) {
  const result = await pool.query(
    "SELECT id, username, email, avatar, status, bio, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

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

export async function updateUserProfileComplete(
  userId: string,
  avatar: string,
  status: string,
  bio: string
) {
  const result = await pool.query(
    `UPDATE users 
     SET avatar = $1, status = $2, bio = $3 
     WHERE id = $4 
     RETURNING id, username, email, avatar, status, bio, created_at`,
    [avatar, status, bio, userId]
  );
  return result.rows[0];
}

export async function updateUserStatus(userId: string, status: string) {
  await pool.query("UPDATE users SET status = $1 WHERE id = $2", [
    status,
    userId,
  ]);
}

// ============================================================================
// MESSAGE FUNCTIONS
// ============================================================================

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
// FRIEND FUNCTIONS
// ============================================================================

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

export async function getFriendRequest(requestId: string) {
  const result = await pool.query(
    `SELECT * FROM friend_requests WHERE id = $1`,
    [requestId]
  );
  return result.rows[0];
}

export async function acceptFriendRequest(
  requestId: string,
  userId: string,
  friendId: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update friend request status
    await client.query("UPDATE friend_requests SET status = $1 WHERE id = $2", [
      "accepted",
      requestId,
    ]);

    // Create friend relationship (both directions)
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

export async function rejectFriendRequest(requestId: string) {
  await pool.query("UPDATE friend_requests SET status = $1 WHERE id = $2", [
    "rejected",
    requestId,
  ]);
  return { success: true, message: "Friend request rejected" };
}

// ============================================================================
// DIRECT MESSAGE FUNCTIONS
// ============================================================================

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

export async function updateDirectMessage(messageId: string, text: string) {
  const now = new Date().toISOString();
  await pool.query(
    `UPDATE direct_messages SET text = $1, edited_at = $2 WHERE id = $3`,
    [text, now, messageId]
  );
  return { updated: true };
}

export async function deleteDirectMessage(messageId: string) {
  await pool.query(`DELETE FROM direct_messages WHERE id = $1`, [messageId]);
  return { deleted: true };
}

// ============================================================================
// USER SEARCH FUNCTIONS
// ============================================================================

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
