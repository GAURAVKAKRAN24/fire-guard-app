export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address: string | null;
}

export interface CustomerResponse {
  page: number;
  limit: number;
  total: number;
  customers: Customer[];
}