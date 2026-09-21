export interface ServiceRecord { id?: number; extinguisher_id: number | string; service_type: string; service_date: string; next_service_date: string; amount: number; remarks?: string | null; }
export interface ServiceResponse { page: number; limit: number; total: number; services: ServiceRecord[]; }
