import * as sql from "mssql";
import { User } from "../models/user.model";
import { DatabaseService } from "../services/database.service";

export class UserRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async create(user: User): Promise<User> {
    try {
      const pool = await this.db.getConnection();
      console.log("Creating user:", user);
      const result = await pool
        .request()
        .input("name", sql.VarChar, user.name)
        .input("email", sql.VarChar, user.email).query(`
          INSERT INTO users (name, email)
          OUTPUT INSERTED.*
          VALUES (@name, @email)
        `);
      console.log("Create result:", result);
      return result.recordset[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const pool = await this.db.getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM users ORDER BY createdAt DESC");
    return result.recordset;
  }

  async findById(id: number): Promise<User | null> {
    const pool = await this.db.getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM users WHERE id = @id");
    return result.recordset[0] || null;
  }

  async update(id: number, user: Partial<User>): Promise<User | null> {
    const pool = await this.db.getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.VarChar, user.name)
      .input("email", sql.VarChar, user.email).query(`
                UPDATE users 
                SET name = @name, email = @email 
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
    return result.recordset[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const pool = await this.db.getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM users WHERE id = @id");
    return result.rowsAffected[0] > 0;
  }
}
