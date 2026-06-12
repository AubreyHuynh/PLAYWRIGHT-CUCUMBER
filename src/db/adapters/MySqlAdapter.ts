import { IDbAdapter } from './IDbAdapter';
import { ConfigManager } from '../../config/ConfigManager';

export class MySqlAdapter implements IDbAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private connection: any;

  async connect(): Promise<void> {
    const mysql = await import('mysql2/promise');
    const cfg = ConfigManager.getInstance().get().db;
    this.connection = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      database: cfg.name,
      user: cfg.user,
      password: cfg.password,
    });
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const [rows] = await this.connection.execute(sql, params);
    return rows as T[];
  }

  async disconnect(): Promise<void> {
    await this.connection?.end();
  }
}
