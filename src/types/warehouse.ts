
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
    warehouseName: string,
    userName: string,
    price: number,
    participantName: string,
    unit: string;
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
