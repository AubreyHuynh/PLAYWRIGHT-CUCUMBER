import { IDbAdapter } from './IDbAdapter';
import { ConfigManager } from '../../config/ConfigManager';

export class PostgresAdapter implements IDbAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  async connect(): Promise<void> {
    const { Client } = await import('pg');
    const cfg = ConfigManager.getInstance().get().db;
    this.client = new Client({
      host: cfg.host,
      port: cfg.port,
      database: cfg.name,
      user: cfg.user,
      password: cfg.password,
    });
    await this.client.connect();
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.client.query(sql, params);
    return result.rows as T[];
  }

  async disconnect(): Promise<void> {
    await this.client?.end();
  }
}
