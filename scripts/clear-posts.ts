/**
 * Clear all posts from the database
 * Run this script to delete all posts and start fresh
 */

import { pool } from '../lib/postgres';

async function clearPosts() {
  try {
    console.log('🗑️  Clearing all posts...');
    
    const result = await pool.query('DELETE FROM posts');
    
    console.log(`✅ Deleted ${result.rowCount} posts`);
    console.log('✨ Database is clean! You can now create new posts.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing posts:', error);
    process.exit(1);
  }
}

clearPosts();
