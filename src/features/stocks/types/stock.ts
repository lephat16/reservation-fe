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

export interface WarehouseWitdhLocationData {
    id: string,
    name: string,
    location: string
}
export interface StockHistoriesWithDetailData {
    id: number,
    inventoryStockId: number
    changeQty: number,
    type: string,
    refType: string,
    refId: number,
    notes: string,
    createdAt: string,
    supplierSku: string,
    productName: string,
    code: string,
    warehouseName: string,
    userName: string,
    price: number,
    participantName: string,
    unit: string,
    signedQty: number,
    afterQty: number,
    beforeQty: number,
}

export interface StockData {
    id: number;
    productId: number;
    productName: string;
    warehouseName: string;
    quantity: number;
    reservedQuantity: number;
    sku?: string;
};

export interface WarehousesData {
    id: number;
    name: string;
    location: string;
    status: "ACTIVE" | "INACTIVE";
    stockLimit: number;
    createdAt: string;
    updatedAt: string;
    stocks: StockData[];
};

export interface WarehouseFormData {
    name: string;
    location: string;
    stockLimit: number;
    status: 'ACTIVE' | 'INACTIVE';
};

export interface WarehouseWithTotalChangedQtyData {
    id: number;
    name: string;
    location: string;
    totalReceivedPo: number;
    totalDeliveredSo: number;
    totalReceivedPoInWeek: number;
    totalDeliveredSoInWeek: number;
};
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
export interface DeliverStockItem {
    detailId: string,
    warehouseId: string,
    deliveredQty: number,
    note: string,
}
export interface StockResultData {
    orderId: string,
    status: string,
    completedDetailIds: number[],
    stockHistories: string[],
}
export interface ReceiveStockItem {
    detailId: string,
    warehouseId: string,
    receivedQty: number,
    note: string,
}