import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { SumReceivedGroupByProduct } from "../../products/types/product";
import type { PurchaseOrderData, PurchaseOrderItem } from "../types/purchase";

/** 

 * 発注書API 

 * 発注書のCRUD操作を提供する 

 */
export const purchaseAPI = {
    /** 全ての購買オーダーを取得 */
    getPurchaseOrders: async (): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/all-purchases`));
    },
    /** ID で購買オーダーを取得 */
    getPurchaseOrderById: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.get(`/transactions/${poId}/by-purchase`));
    },
    /** サプライヤー単位で購買オーダーを取得 */
    getPurchaseOrderBySupplier: async (supplierId: number): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/purchase/${supplierId}/get-po-by-supplier`));
    },
    /** 新しい購買オーダーを作成 */
    createPurchaseOrder: async (purchaseData: PurchaseOrderItem): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.post(`/transactions/add-purchase`, purchaseData));
    },
    /** POごとの受領数量を商品単位で集計 */
    getSumReceivedQtyByPoGroupByProduct: async (poId: number): Promise<ApiResponse<SumReceivedGroupByProduct[]>> => {
        return (await api.get(`/products/${poId}/received-qty`));
    },
    /** POの数量と説明を更新 */
    updatePurchaseOrderQuantityAndDescription: async (poId: number, data: PurchaseOrderData): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/${poId}/update-qty-and-desc`, data));
    },
    /** POを確定（発注）する */
    placePurchaseOrder: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/${poId}/place`));
    },
    /** POを削除 */
    deletePurchaseOrder: async (orderId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/transactions/purchase/${orderId}/delete-po`));
    },


}