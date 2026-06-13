export interface IDbAdapter {
  connect(): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  disconnect(): Promise<void>;
}
