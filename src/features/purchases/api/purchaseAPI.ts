import { api } from "../../../shared/api/axiosClient";
import type { ApiResponse } from "../../../shared";
import type { SumReceivedGroupByProduct } from "../../products/types/product";
import type { PurchaseOrderData, PurchaseOrderItem } from "../types/purchase";

/** 

 * 注文書API 

 * 注文書のCRUD操作を提供する 

 */
export const purchaseAPI = {
    /** 全ての購買オーダーを取得 */
    getPurchaseOrders: async (): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/purchase/all`));
    },
    /** ID で購買オーダーを取得 */
    getPurchaseOrderById: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.get(`/transactions/purchase/${poId}`));
    },
    /** サプライヤー単位で購買オーダーを取得 */
    getPurchaseOrderBySupplier: async (supplierId: number): Promise<ApiResponse<PurchaseOrderData[]>> => {
        return (await api.get(`/transactions/purchase/by-supplier/${supplierId}`));
    },
    /** 新しい購買オーダーを作成 */
    createPurchaseOrder: async (purchaseData: PurchaseOrderItem): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.post(`/transactions/purchase/add`, purchaseData));
    },
    /** POごとの受領数量を商品単位で集計 */
    getSumReceivedQtyByPoGroupByProduct: async (poId: number): Promise<ApiResponse<SumReceivedGroupByProduct[]>> => {
        return (await api.get(`/products/received-qty/${poId}`));
    },
    /** POの数量と説明を更新 */
    updatePurchaseOrderQuantityAndDescription: async (poId: number, data: PurchaseOrderData): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/update-qty-and-desc/${poId}`, data));
    },
    /** POを確定（発注）する */
    placePurchaseOrder: async (poId: number): Promise<ApiResponse<PurchaseOrderData>> => {
        return (await api.put(`/transactions/purchase/place/${poId}`));
    },
    /** POを削除 */
    deletePurchaseOrder: async (orderId: number): Promise<ApiResponse<void>> => {
        return (await api.delete(`/transactions/purchase/delete/${orderId}`));
    },


}