import { IDbAdapter } from './adapters/IDbAdapter';
import { ConfigManager } from '../config/ConfigManager';

export class DbManager {
  private static instance: DbManager;
  private adapter?: IDbAdapter;
  private connected = false;

  private constructor() {}

  static getInstance(): DbManager {
    if (!DbManager.instance) {
      DbManager.instance = new DbManager();
    }
    return DbManager.instance;
  }

  async connect(): Promise<void> {
    const type = ConfigManager.getInstance().get().db.type;
    if (type === 'none') return;

    if (type === 'pg') {
      const { PostgresAdapter } = await import('./adapters/PostgresAdapter');
      this.adapter = new PostgresAdapter();
    } else if (type === 'mysql') {
      const { MySqlAdapter } = await import('./adapters/MySqlAdapter');
      this.adapter = new MySqlAdapter();
    }

    await this.adapter?.connect();
    this.connected = true;
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.adapter || !this.connected) {
      throw new Error('DbManager: not connected. Call connect() first or tag scenario @db.');
    }
    return this.adapter.query<T>(sql, params);
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.adapter?.disconnect();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
