import { api } from "../../../api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { SaleOrderData, SellOrderItem, WeeklySalesByProduct } from "../types/sell";

export const saleAPI = {
    getSaleOrders: async (): Promise<ApiResponse<SaleOrderData[]>> => {
        return (await api.get(`/transactions/sales/all`));
    },
    getSaleOrderById: async (soId: number): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.get(`/transactions/sales/${soId}`));
    },
    updateSalesOrderQuantityAndDescription: async (soId: number, data: SaleOrderData): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.put(`/transactions/sales/update-qty-and-desc/${soId}`, data));
    },
    createSaleOrder: async (sellData: SellOrderItem): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.post(`/transactions/sales/add`, sellData));
    },
    prepareSaleOrder: async (soId: number): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.put(`/transactions/sales/prepare/${soId}`));
    },
    prepareOrder: async (soId: number): Promise<ApiResponse<SaleOrderData>> => {
        return (await api.put(`/transactions/sales/prepare/${soId}`));
    },
    deleteSellOrder: async (orderId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/transactions/sales/delete/${orderId}`));
    },
    getWeeklySalesByProduct: async (productId: number): Promise<ApiResponse<WeeklySalesByProduct[]>> => {
        return (await api.get(`/transactions/sales-order/${productId}/weekly-sales`));
    },
}



