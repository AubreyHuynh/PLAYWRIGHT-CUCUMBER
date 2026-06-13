import { ApiClient } from '../ApiClient';
import { ApiResponse, ApiCreateAccountRequest, ApiUserDetail } from '../models';

export class AccountsApi extends ApiClient {
  async createAccount(data: ApiCreateAccountRequest): Promise<ApiResponse> {
    const form = new URLSearchParams(data as unknown as Record<string, string>);
    const res = await this.post<ApiResponse>('/createAccount', form);
    return res.data;
  }

  async verifyLogin(email: string, password: string): Promise<ApiResponse> {
    const form = new URLSearchParams({ email, password });
    const res = await this.post<ApiResponse>('/verifyLogin', form);
    return res.data;
  }

  async getUserDetail(email: string): Promise<ApiUserDetail> {
    const res = await this.get<ApiUserDetail>('/getUserDetailByEmail', { email });
    return res.data;
  }

  async updateAccount(data: ApiCreateAccountRequest): Promise<ApiResponse> {
    const form = new URLSearchParams(data as unknown as Record<string, string>);
    const res = await this.put<ApiResponse>('/updateAccount', form);
    return res.data;
  }

  async deleteAccount(email: string, password: string): Promise<ApiResponse> {
    const form = new URLSearchParams({ email, password });
    const res = await this.http.delete<ApiResponse>('/deleteAccount', {
      data: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  }
}
