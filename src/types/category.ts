
export interface CategoryData {
    id?: number;
    name: string;
    description: string;
    imageUrl: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt?: string;
    updatedAt?: string;
}

export interface CategorySummariesData {
    id?: number;
    categoryName: string;
    products: string[] | null;
    suppliers: string[] | null;
    status: "ACTIVE" | "INACTIVE";
}
export interface CategorySummaryData {
    categoryId: number;
    categoryName: string;
    products?: ProductStockData[];
}
export interface ProductStockData {
    productName: string;
    suppliers: SupplierData[];
    stocks?: StockData[];
}
export interface SupplierData {
    supplierId?: number;
    supplierName: string;
    price: number;
    sku?: string;
}
export interface StockData {
    quantity: number;
    warehouse: string;
}