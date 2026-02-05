import type { ResponseData } from "../../../shared";

export interface SupplierData {
    id?: number
    name: string;
    contactInfo: string;
    mail: string;
    address: string;
    supplierStatus: "ACTIVE" | "INACTIVE";
    categoryNames?: string[];
}
export interface SupplierProductData {
    id: number;
    sku: string;
    product: string;
    price: number;
    stock?: number;
    leadTime?: number;
    status?: "ACTIVE" | "INACTIVE";
    priceHistories?: PriceHistoriesData[];
}


export interface SupplierProductWithCategoryData {
    categoryName?: string;
    categoryId?: number;
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
export interface SupplierDataWithSku {
    supplierId?: number;
    supplierName: string;
    price: number;
    sku?: string;
}

export interface PriceHistoriesData {
    id: number,
    supplierProductId: number,
    price: number,
    effectiveDate: string,
    note: string,
    createdAt: string
}
export interface SupplierProducWithPriceHistory {
    id: number,
    supplierId: number,
    supplierName: string,
    productId?: number,
    productName: string,
    supplierSku: string,
    currentPrice: number,
    leadTime: number,
    status: "ACTIVE" | "INACTIVE",
    priceHistories: PriceHistoriesData[],
}

export type SupplierProductFormType = Pick<
    SupplierProducWithPriceHistory,
    "supplierSku" | "currentPrice" | "leadTime" | "status" | "productId"
> & {
    note?: string,
};