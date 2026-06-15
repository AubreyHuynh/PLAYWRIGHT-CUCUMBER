import { ApiClient } from '../client';
import { ApiResponse, ApiCreateAccountRequest } from '../models';
import { toFormParams } from '../payloadBuilder';

export class AccountsApi extends ApiClient {
  async createAccount(data: ApiCreateAccountRequest): Promise<ApiResponse> {
    const res = await this.post<ApiResponse>('/createAccount', toFormParams(data as Record<string, string | undefined>));
    return res.data;
  }

  async verifyLogin(email: string, password: string): Promise<ApiResponse> {
    const res = await this.post<ApiResponse>('/verifyLogin', toFormParams({ email, password }));
    return res.data;
  }

  async deleteAccount(email: string, password: string): Promise<ApiResponse> {
    const form = toFormParams({ email, password });
    const res = await this.http.delete<ApiResponse>('/deleteAccount', {
      data: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  }
}
