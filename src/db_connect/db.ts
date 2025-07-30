import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  port: 3307,
  password: 'root',
  database: 'hrms',
  ssl: false
});

export const dbConnect = async () => {
  try {
    await client.connect();
    console.log('PostgreSQL connected successfully !!');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
};

export const db = drizzle(client);
