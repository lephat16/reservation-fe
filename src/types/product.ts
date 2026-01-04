import type { SupplierData } from "./category";

export interface ProductData {
    productName: string;
    code: string;
    description?: string;
    status: "ACTIVE" | "INACTIVE";
    totalStock: number;
    categoryName: string;
    supplier: SupplierData[];
}

export interface ProductDetailData {
    id: number
    name: string;
    productCode: string;
    description?: string;
    status: "ACTIVE" | "INACTIVE";
    unit: string;
    totalStock: number;
    categoryName: string;
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