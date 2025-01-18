import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function deleteDatabase() {
  // Initialize and run the seeder
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true, // Ensures the schema is synchronized with entities
    dropSchema: true, // Drops the schema and recreates it each time (deletes all data)
  });

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data source has been initialized!');

    // Drop the database
    console.log('Dropping the database...');
    await AppDataSource.dropDatabase();
    console.log('Database dropped successfully.');
  } catch (error) {
    console.error('Error while dropping the database:', error);
  } finally {
    // Properly close the connection
    await AppDataSource.destroy();
    console.log('Connection closed.');
  }
}

deleteDatabase();
