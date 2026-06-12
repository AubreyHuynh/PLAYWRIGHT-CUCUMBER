import { ApiClient } from '../ApiClient';
import { ApiProductList, ApiSearchResult } from '../models';

export class ProductsApi extends ApiClient {
  async getAllProducts(): Promise<ApiProductList> {
    const res = await this.get<ApiProductList>('/productsList');
    return res.data;
  }

  async searchProduct(keyword: string): Promise<ApiSearchResult> {
    const form = new URLSearchParams({ search_product: keyword });
    const res = await this.post<ApiSearchResult>('/searchProduct', form);
    return res.data;
  }
}
