import type { ResponseData } from ".";

export interface SupplierData {
    id: number
    name: string;
    contactInfo: string;
    address: string;
    supplierStatus: string;
    categories: string[];
}

export interface SupplierResponse extends ResponseData {
    supplier?: SupplierData;
    suppliers: SupplierData[];
}