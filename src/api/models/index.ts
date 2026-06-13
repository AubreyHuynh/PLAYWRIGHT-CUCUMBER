export interface ApiResponse<T = unknown> {
  responseCode: number;
  message?: string;
  data?: T;
}

export interface ApiProduct {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface ApiProductList {
  responseCode: number;
  products: ApiProduct[];
}

export interface ApiSearchResult {
  responseCode: number;
  products: ApiProduct[];
}

export interface ApiCreateAccountRequest {
  name: string;
  email: string;
  password: string;
  title?: string;
  birth_date?: string;
  birth_month?: string;
  birth_year?: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  address1?: string;
  address2?: string;
  country?: string;
  zipcode?: string;
  state?: string;
  city?: string;
  mobile_number?: string;
}

export interface ApiUserDetail {
  responseCode: number;
  user: {
    id: number;
    name: string;
    email: string;
    title: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
    first_name: string;
    last_name: string;
    company: string;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
  };
}
