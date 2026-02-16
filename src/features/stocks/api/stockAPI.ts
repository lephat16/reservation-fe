import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { WarehouseWithLocationData } from "../../products/types/product";
import type { DeliverStockItem, InventoryHistoryByPurchaseOrder, InventoryHistoryBySaleOrder, ReceiveStockItem, StockHistoriesWithDetailData, StockResultData, StockWithSupplierAndProduct, WarehouseFormData, WarehousesData, WarehouseWithTotalChangedQtyData } from "../types/stock";

export const stockAPI = {
    getAllWarehouseWithLocation: async (): Promise<ApiResponse<WarehouseWithLocationData[]>> => {
        return (await api.get(`/warehouses/with-location/all`));
    },
    getAllWarehouseWithLocationBySku: async (sku: string): Promise<ApiResponse<WarehouseWithLocationData[]>> => {
        return (await api.get(`/warehouses/all-by-sku/with-location/${sku}`));
    },
    getInventoryHistoryByPurchaseOrder: async (poId: number): Promise<ApiResponse<InventoryHistoryByPurchaseOrder[]>> => {
        return (await api.get(`/inventory/stock-history/purchase-order/${poId}`));
    },
    getAllStockHistoriesWithDetails: async (): Promise<ApiResponse<StockHistoriesWithDetailData[]>> => {
        return (await api.get(`/inventory/stock-history/with-details/all`));
    },
    getAllWarehouses: async (): Promise<ApiResponse<WarehousesData[]>> => {
        return (await api.get(`/warehouses/all`));
    },
    getWarehouseWithTotalChangedQty: async (): Promise<ApiResponse<WarehouseWithTotalChangedQtyData[]>> => {
        return (await api.get(`/warehouses/all-with-total-changed-qty`));
    },
    createWarehouse: async (createItem: WarehouseFormData): Promise<ApiResponse<WarehousesData>> => {
        return (await api.post(`/warehouses/add`, createItem));
    },
    updateWarehouse: async (id: number, updateItem: WarehouseFormData): Promise<ApiResponse<WarehousesData>> => {
        return (await api.put(`/warehouses/update/${id}`, updateItem));
    },
    deleteWarehouse: async (id: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/warehouses/delete/${id}`));
    },
    deliverStock: async (deliverItem: DeliverStockItem[], soId: number): Promise<ApiResponse<StockResultData[]>> => {
        return (await api.post(`/inventory/stock/deliver-stock/${soId}`, deliverItem));
    },
    receiveStock: async (receiveItem: ReceiveStockItem[], poId: number): Promise<ApiResponse<StockResultData[]>> => {
        return (await api.post(`/inventory/stock/receive-stock/${poId}`, receiveItem));
    },
    getInventoryHistoryBySaleOrder: async (soId: number): Promise<ApiResponse<InventoryHistoryBySaleOrder[]>> => {
        return (await api.get(`/inventory/stock-history/sale-order/${soId}`));
    },
    getAllStockWithSupplierAndProduct: async (): Promise<ApiResponse<StockWithSupplierAndProduct[]>> => {
        return (await api.get(`/inventory/stock/all-with-supplier`));
    },
}
