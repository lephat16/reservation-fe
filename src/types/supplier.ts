import type { ResponseData } from ".";

export interface SupplierData {
    id: number
    name: string;
    contactInfo: string;
    address: string;
    supplierStatus: string;
    categoryNames: string[];
}
export interface SupplierProductData {
    id: number;
    sku: string;
    product: string;
    price: number;
    stock?: number;
    leadTime?: number;
}


export interface SupplierProductWithCategoryData {
    categoryName?: string;
    supplierName?: string;
    supplierId?: string;
    products: SupplierProductData[];
}

export interface ProductWithSkuByCategoryData {
    supplierProductId: number;
    categoryName: string;
    productId: number;
    productName: string;
    sku: string;
    unit: string;
    status: string;
    price: number;
    totalQuantity: number;
    totalReservedQuantity: number;
}

export interface SupplierResponse extends ResponseData {
    supplier?: SupplierData;
    suppliers: SupplierData[];
}