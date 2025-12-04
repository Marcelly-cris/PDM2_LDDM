import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

class Database {
  private static instance: Pool;

  private constructor() {} // impede new Database()

  static getInstance(): Pool {
    if (!Database.instance) {
      console.log("Criando nova instância do Pool...");
      Database.instance = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
      });
    }

    return Database.instance;
  }
}

export default Database;
