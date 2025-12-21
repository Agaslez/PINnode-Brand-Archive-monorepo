import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';

// Load environment variables
dotenv.config();

// Use SQLite for local development to avoid PostgreSQL dependency
// Create database in current working directory
const dbPath = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('./') 
  ? process.env.DATABASE_URL 
  : './pinnode.db';

const db_instance = new Database(dbPath);
export const db = drizzle(db_instance);

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    db_instance.exec('SELECT 1');
    console.log('✅ SQLite database connected successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection error:', error?.message || 'Unknown error');
    return false;
  }
};

// Initialize database connection on startup
testDatabaseConnection();