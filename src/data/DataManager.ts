import { User } from './builders/UserBuilder';

interface CreatedAccount {
  email: string;
  password: string;
  createdVia: 'ui' | 'api';
}

/**
 * Singleton that tracks test data created during a run so it can be torn down.
 */
export class DataManager {
  private static instance: DataManager;
  private accounts: CreatedAccount[] = [];
  private apiClient?: { deleteAccount: (email: string, password: string) => Promise<void> };

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  registerApiClient(client: { deleteAccount: (email: string, password: string) => Promise<void> }): void {
    this.apiClient = client;
  }

  trackAccount(user: Pick<User, 'email' | 'password'>, via: 'ui' | 'api' = 'api'): void {
    this.accounts.push({ email: user.email, password: user.password, createdVia: via });
  }

  async teardownAll(): Promise<void> {
    for (const account of this.accounts) {
      try {
        await this.apiClient?.deleteAccount(account.email, account.password);
      } catch (err) {
        console.warn(`[DataManager] teardown failed for account "${account.email}":`, err);
      }
    }
    this.accounts = [];
  }

  reset(): void {
    this.accounts = [];
  }
}
