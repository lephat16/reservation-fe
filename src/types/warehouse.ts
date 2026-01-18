
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
    participant_name: string,
    unit: string;
}