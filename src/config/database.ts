import { DefaultAzureCredential } from "@azure/identity";
import * as sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  getConnectionConfig(): Promise<sql.config>;
}

class DefaultCredentialConfig implements DatabaseConfig {
  async getConnectionConfig(): Promise<sql.config> {
    try {
      const credential = new DefaultAzureCredential();
      const token = await credential.getToken("https://database.windows.net/");

      if (!process.env.DB_SERVER || !process.env.DB_NAME) {
        throw new Error("Database configuration is incomplete");
      }

      return {
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: token.token,
          },
        },
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
          connectTimeout: 30000,
          requestTimeout: 30000,
        },
      };
    } catch (error) {
      console.error("Failed to get Azure credential:", error);
      throw error;
    }
  }
}

class ODBCConfig implements DatabaseConfig {
  async getConnectionConfig(): Promise<sql.config> {
    if (
      !process.env.DB_SERVER ||
      !process.env.DB_NAME ||
      !process.env.DB_USER ||
      !process.env.DB_PASSWORD
    ) {
      throw new Error("Database configuration is incomplete");
    }

    return {
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      authentication: {
        type: "default",
        options: {
          userName: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        },
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000,
        port: 1433,
      },
    };
  }
}

export const getDatabaseConfig = (): DatabaseConfig => {
  return process.env.USE_MANAGED_IDENTITY === "true"
    ? new DefaultCredentialConfig()
    : new ODBCConfig();
};
