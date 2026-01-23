export interface ProductStockData {
    categoryName: string;
    description: string;
    id: string;
    name: string;
    productCode: string;
    status: string;
    unit: string;
}
export interface SupplierProductStockData {
    currentPrice: number;
    id: number;
    leadTime: number;
    productId: number;
    productName: string;
    status: string;
    supplierId: number
    supplierName: string;
    supplierSku: string;
}
export interface StockWithSupplierAndProduct {
    id: number,
    productId: number,
    productName: string,
    sku: string,
    warehouseName: string,
    quantity: number,
    reservedQuantity: number,
    product: ProductStockData,
    supplierProduct: SupplierProductStockData
}