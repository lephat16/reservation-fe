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

export interface TransactionResponseDTO  {
    id: number;
    totalProducts: number;
    totalPrice: number;
    transactionType: "PURCHASE" | "SALE" | "RETURN_TO_SUPPLIER";
    createdAt: string;
}
export interface DashboardDTO  {
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