import type { STATUS } from "../../../constants/status";
import type { SupplierDataWithSku } from "../../suppliers/types/supplier";

export interface CategoryData {
    id?: number;
    name: string;
    description: string;
    imageUrl?: string;
    status: keyof typeof STATUS;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategorySummariesData {
    id?: number;
    categoryName: string;
    products: string;
    suppliers: string;
    status: keyof typeof STATUS;
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
export interface CategoryFormData {
    name: string;
    status: keyof typeof STATUS;
    description: string;
    imageUrl: File | string | null;
};