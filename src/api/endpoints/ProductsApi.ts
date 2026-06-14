import { ApiClient } from '../client';
import { ApiProductList, ApiSearchResult } from '../models';
import { toFormParams } from '../payloadBuilder';

export class ProductsApi extends ApiClient {
  async getAllProducts(): Promise<ApiProductList> {
    const res = await this.get<ApiProductList>('/productsList');
    return res.data;
  }

  async searchProduct(keyword: string): Promise<ApiSearchResult> {
    const res = await this.post<ApiSearchResult>('/searchProduct', toFormParams({ search_product: keyword }));
    return res.data;
  }
}
