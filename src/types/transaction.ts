interface BaseTransaction {
    productId: number;
    quantity: number;
    description: string;
    note: string;
    message?: string;
}
export interface TransactionsResponse {
    status: string;
    message: string;
    transactions: TransactionData[];
}
export interface TransactionData {
    id: number,
    totalProducts: number,
    totalPrice: number,
    transactionType: string,
    transactionStatus: string,
    description: string,
    note: string,
    createdAt: string,
    productId: number,
    productName: string,
    userId: number,
    username: string,
    supplierId?: number,
    supplierName?: string
}
export interface PurchaseDataResponse extends BaseTransaction {
    supplierId: number;
}

export interface PurchaseDataRequest {
    productId: number;
    supplierId: number;
    quantity: number;
    description: string;
    note: string;
}

export interface SellDataRequest {
    productId: number;
    quantity: number;
    description: string;
    note: string;
}

export interface TransactionResponseDTO {
    id: number;
    totalProducts: number;
    totalPrice: number;
    transactionType: "PURCHASE" | "SALE" | "RETURN_TO_SUPPLIER";
    createdAt: string;
}
export interface DashboardDTO {
    todaySales: number;
    weeklySales: number;
    monthlySales: number;
    todayPurchases: number;
    weeklyPurchases: number;
    monthlyPurchases: number;
    outOfStockCount: number;
    lowStockCount: number;
    recentTransactions: TransactionResponseDTO[];
};
export interface SellData extends BaseTransaction { }


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
export interface ReceiveStockItem {
    detailId: string,
    warehouseId: string,
    receivedQty: number,
    note: string,
}
export interface StockResultData {
    orderId: string,
    status: string,
    completedDetailIds: number[],
    stockHistories: string[],
}

export interface InventoryHistoryByPurchaseOrder {
    id: number;
    location: string;
    warehouseName: string;
    changeQty: number;
    notes: string;
    productName: string;
    supplierName: string;
    refType: string;
    createdAt: string;
    supplierSku: string;
}
export interface InventoryHistoryBySaleOrder {
    id: number;
    inventoryStockId: number;
    location: string;
    warehouseName: string;
    changeQty: number;
    notes: string;
    productName: string;
    customerName: string;
    refType: string;
    createdAt: string;
    supplierSku: string;
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

export interface DeliverStockItem {
    detailId: string,
    warehouseId: string,
    deliveredQty: number,
    note: string,
}
