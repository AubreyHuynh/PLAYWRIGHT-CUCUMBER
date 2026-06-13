import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ConfigManager } from '../config/ConfigManager';

export class ApiClient {
  private static instance: ApiClient;
  protected http: AxiosInstance;

  constructor(baseURL?: string) {
    this.http = axios.create({
      baseURL: baseURL || ConfigManager.getInstance().getApiBaseUrl(),
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<AxiosResponse<T>> {
    return this.http.get<T>(path, { params });
  }

  async post<T>(path: string, data?: Record<string, unknown> | URLSearchParams): Promise<AxiosResponse<T>> {
    const isForm = data instanceof URLSearchParams;
    return this.http.post<T>(path, data, {
      headers: isForm ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
    });
  }

  async put<T>(path: string, data?: Record<string, unknown> | URLSearchParams): Promise<AxiosResponse<T>> {
    const isForm = data instanceof URLSearchParams;
    return this.http.put<T>(path, data, {
      headers: isForm ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
    });
  }

  async delete<T>(path: string, params?: Record<string, string>): Promise<AxiosResponse<T>> {
    return this.http.delete<T>(path, { params });
  }
}
