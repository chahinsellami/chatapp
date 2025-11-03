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

  // Create messages table
  // Stores all chat messages with sender and receiver information
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create conversations table
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

  console.log("✓ Database initialized successfully");
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
