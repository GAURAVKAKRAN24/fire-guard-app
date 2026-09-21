export interface Extinguisher { id?: number; customer_id: number; extinguisher_no: string; type: string; capacity: string; purchase_date?: string | null; last_service_date?: string | null; next_service_date?: string | null; status: string; }
export interface ExtinguisherResponse { page: number; limit: number; total: number; extinguishers: Extinguisher[]; }
