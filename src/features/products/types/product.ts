import type { SupplierData, SupplierDataWithSku } from "../../suppliers/types/supplier";

export type ProductStatus = "ACTIVE" | "INACTIVE";
export interface ProductData {
    productName: string;
    id?: number;
    code: string;
    description: string;
    status: ProductStatus;
    totalStock: number;
    unit: string;
    categoryName: string;
    supplier?: SupplierData[];
}
export interface ProductDataDTO {
    name: string;
    id?: number;
    productCode: string;
    description: string;
    status: ProductStatus;
    totalStock: number;
    unit: string;
    categoryName: string;
}


export interface ProductDetailDataDTO {
    productDTO: ProductDataDTO;
    supplierPriceDTO: SupplierDataWithSku[];
    stockHistoryDTO: StockHistory[];
    inventoryStockDTO: InventoryStock[]
}
export interface ProductDetailData {
    product: ProductData;
    supplier: SupplierDataWithSku[];
    stockHistory: StockHistory[];
    inventoryStock: InventoryStock[]
}

export interface StockHistory {
    changeQty: number;
    type: string;
    createdAt: string;
}

export interface InventoryStock {
    warehouseName: string;
    quantity: number;
}
export interface WarehouseWithLocationData {
    id: string,
    name: string,
    location: string,
}

export interface SumReceivedGroupByProduct {
    productId: string;
    receivedQty: number;
    sku: string;
}

export interface ProductFormData {
    name: string;
    productCode: string;
    description: string;
    status: ProductStatus;
    unit: string;
    categoryName: string;
}

