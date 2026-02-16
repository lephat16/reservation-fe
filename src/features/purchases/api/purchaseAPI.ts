import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { SumReceivedGroupByProduct } from "../../products/types/product";
import type { PurchaseOrderData, PurchaseOrderItem } from "../types/purchase";

export const purchaseAPI = {
    getPurchaseOrders: async (): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/purchase/all`));
    },
    getPurchaseOrderById: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.get(`/transactions/purchase/${poId}`));
    },
    getPurchaseOrderBySupplier: async (supplierId: number): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/purchase/by-supplier/${supplierId}`));
    },
    createPurchaseOrder: async (purchaseData: PurchaseOrderItem): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.post(`/transactions/purchase/add`, purchaseData));
    },
    getSumReceivedQtyByPoGroupByProduct: async (poId: number): Promise<ApiResponse<SumReceivedGroupByProduct[]>> => {
        return (await api.get(`/products/received-qty/${poId}`));
    },
    updatePurchaseOrderQuantityAndDescription: async (poId: number, data: PurchaseOrderData): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/update-qty-and-desc/${poId}`, data));
    },
    placePurchaseOrder: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/place/${poId}`));
    },
    deletePurchaseOrder: async (orderId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/transactions/purchase/delete/${orderId}`));
    },
    

}