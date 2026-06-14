import { AccountsApi } from './endpoints/AccountsApi';
import { DataManager } from '../data/DataManager';
import { User } from '../data/builders/UserBuilder';
import { ApiResponse } from './models';
import { buildCreateAccountPayload } from './payloadBuilder';

export class APIHelper {
  private accounts = new AccountsApi();

  async createUser(user: User): Promise<ApiResponse> {
    const payload = buildCreateAccountPayload(user);
    const response = await this.accounts.createAccount(payload);
    DataManager.getInstance().trackAccount(user, 'api');
    return response;
  }

  async deleteUser(email: string, password: string): Promise<ApiResponse> {
    return this.accounts.deleteAccount(email, password);
  }

  async verifyLogin(email: string, password: string): Promise<ApiResponse> {
    return this.accounts.verifyLogin(email, password);
  }
}
