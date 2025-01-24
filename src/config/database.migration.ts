import { DatabaseService } from "../services/database.service";

export async function createUsersTable() {
  try {
    const db = DatabaseService.getInstance();
    const pool = await db.getConnection();

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
      BEGIN
        CREATE TABLE users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          createdAt DATETIME DEFAULT GETDATE()
        )
      END
    `);

    console.log("Users table created or already exists");
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
}
