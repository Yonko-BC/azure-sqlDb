import { ConnectionPool } from "mssql";
import { getDatabaseConfig } from "../config/database";

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: ConnectionPool | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async getConnection(): Promise<ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    if (this.isConnecting) {
      throw new Error("Connection attempt already in progress");
    }

    try {
      this.isConnecting = true;
      const config = await getDatabaseConfig().getConnectionConfig();
      this.pool = await new ConnectionPool(config).connect();

      this.pool.on("error", async (err) => {
        console.error("Database pool error:", err);
        await this.handleConnectionError();
      });

      this.reconnectAttempts = 0;
      return this.pool;
    } catch (error) {
      await this.handleConnectionError();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleConnectionError(): Promise<void> {
    this.reconnectAttempts++;
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      throw new Error("Database connection failed");
    }
  }

  async closeConnection(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}
