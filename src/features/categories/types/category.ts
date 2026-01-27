import type { SupplierDataWithSku } from "../../suppliers/types/supplier";

export interface CategoryData {
    id?: number;
    name: string;
    description: string;
    imageUrl?: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt?: string;
    updatedAt?: string;
}

export interface CategorySummariesData {
    id?: number;
    categoryName: string;
    products: string;
    suppliers: string;
    status: "ACTIVE" | "INACTIVE";
}
export interface CategorySummaryData {
    categoryId: number;
    categoryName: string;
    products?: ProductStockData[];
}
export interface ProductStockData {
    productName: string;
    suppliers: SupplierDataWithSku[];
    stocks?: StockData[];
}


export interface StockData {
    quantity: number;
    warehouse: string;
}