import type { SupplierProductData } from "../../suppliers/types/supplier";

export type OrderStatus =
    | "NEW"
    | "PROCESSING"
    | "COMPLETED"
    | "CANCELLED"
    | "PENDING";

export interface PurchaseOrderDetailData {
    id: string,
    purchaseOrderId: string,
    productId: number,
    productName: string,
    qty: number,
    cost: number,
    status: OrderStatus,
    sku?: string,
    received?: number,
}
export interface PurchaseOrderData {
    id: string,
    supplierId: string,
    supplierName: string,
    userId: string,
    userName: string,
    status: OrderStatus,
    description: string,
    total: number,
    createdAt: string,
    details: PurchaseOrderDetailData[]
}
export interface PurchaseDetail {
    productId: number;
    qty: number;
    cost: number;
    note: string;
};
export interface PurchaseOrderItem {
    supplierId: number;
    details: PurchaseDetail[];
    description: string;
}

export type PurchaseRow = {
    product: SupplierProductData | null;
    qty: number;
    note: string;
};