import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { SaleOrderData, SellOrderItem, WeeklySalesByProduct } from "../types/sell";

export const saleAPI = {
    getSaleOrders: async (): Promise<ApiResponse<SaleOrderData[]>> => {
        return (await api.get(`/transactions/all-sales`));
    },
    getSaleOrderById: async (soId: number): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.get(`/transactions/${soId}/by-sale`));
    },
    updateSalesOrderQuantityAndDescription: async (soId: number, data: SaleOrderData): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.put(`/transactions/sales/${soId}/update-qty-and-desc`, data));
    },
    createSaleOrder: async (sellData: SellOrderItem): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.post(`/transactions/add-sales`, sellData));
    },
    prepareSaleOrder: async (soId: number): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.put(`/transactions/sales/${soId}/prepare`));
    },
    deleteSellOrder: async (orderId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/transactions/sales/${orderId}/delete-sale`));
    },
    getWeeklySalesByProduct: async (productId: number): Promise<ApiResponse<WeeklySalesByProduct[]>> => {
        return (await api.get(`/transactions/sales-order/${productId}/weekly-sales`));
    },
}



