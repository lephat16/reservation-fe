import type { OrderStatus } from "../../purchases/types/purchase";

export interface SellDataRequest {
    productId: number;
    quantity: number;
    description: string;
    note: string;
}
export interface SellDetail {
    productId: number;
    sku: string;
    qty: number;
    price: number;
    note: string;
};
export interface SellOrderItem {
    customerName: string;
    details: SellDetail[];
    description: string;
}


export interface SaleOrderDetailData {
    id: string,
    salesOrderId: string,
    productId: number,
    productName: string,
    qty: number,
    price: number,
    status: OrderStatus,
    sku?: string,
    deliveredQty: number,
}

export interface SaleOrderData {
    id: string,
    customerName: string,
    userId: string,
    userName: string,
    status: OrderStatus,
    description: string,
    total: number,
    createdAt: string,
    details: SaleOrderDetailData[]
}

