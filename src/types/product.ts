import type { SupplierData } from "./category";

export interface ProductData {
    productName: string;
    id?: number;
    code: string;
    description: string;
    status: "ACTIVE" | "INACTIVE";
    totalStock: number;
    unit: string;
    categoryName: string;
    supplier?: SupplierData[];
}

export interface ProductDetailData {
    product: ProductData;
    supplier: SupplierData[];
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
